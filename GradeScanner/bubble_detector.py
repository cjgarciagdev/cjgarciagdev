"""
GradeScanner - Bubble Sheet Detector (Optimizado para 500MB RAM)
Motor de detección de burbujas rellenas para hojas de respuesta de opción múltiple.
Optimizado para bajo consumo de memoria en hosts como Render (512MB).

Soporta múltiples formatos de bubble sheets:
  - Burbujas con letras A-E encima (como la imagen de referencia)
  - Hojas estándar tipo Scantron  
  - Formatos con cuadrícula y burbujas alineadas
  - Formatos con burbujas horizontales por pregunta
"""

import cv2
import numpy as np
import os
import gc
from typing import List, Dict, Tuple, Optional

# Tamaño máximo al que se redimensiona una imagen antes de procesar
# Mantiene calidad suficiente para detección pero reduce uso de RAM
MAX_PROCESSING_SIZE = 1200  # píxeles en la dimensión más grande


class BubbleDetector:
    """
    Detector de burbujas para hojas de opción múltiple.
    Optimizado para bajo consumo de memoria (~20-40MB por imagen).
    """

    def __init__(self, options: List[str] = None, debug: bool = False):
        self.options = options or ['A', 'B', 'C', 'D', 'E']
        self.num_options = len(self.options)
        self.debug = debug

    def _resize_for_processing(self, image: np.ndarray) -> np.ndarray:
        """Redimensiona imagen si es demasiado grande para ahorrar RAM."""
        h, w = image.shape[:2]
        max_dim = max(h, w)
        
        if max_dim > MAX_PROCESSING_SIZE:
            scale = MAX_PROCESSING_SIZE / max_dim
            new_w = int(w * scale)
            new_h = int(h * scale)
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
            print(f"[BubbleDetector] Imagen redimensionada: {w}x{h} -> {new_w}x{new_h} (ahorro RAM)")
        
        return image

    def detect_answers(self, image_path: str, num_questions: int = None) -> Dict:
        """
        Detecta las respuestas marcadas en una hoja de burbujas.
        """
        if not os.path.exists(image_path):
            return {'answers': [], 'confidence': 0, 'error': 'Archivo no encontrado'}

        try:
            # Leer imagen
            image = cv2.imread(image_path)
            if image is None:
                return {'answers': [], 'confidence': 0, 'error': 'No se pudo leer la imagen'}

            # Redimensionar para ahorrar memoria
            image = self._resize_for_processing(image)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Intentar estrategias de detección (en orden de eficacia)
            results = []
            
            # Estrategia 1: Detección por contornos circulares
            result1 = self._detect_by_contours(image, gray, num_questions)
            if result1 and result1.get('answers'):
                results.append(('contours', result1))
            
            # Estrategia 2: Detección por análisis de cuadrícula
            result2 = self._detect_by_grid(image, gray, num_questions)
            if result2 and result2.get('answers'):
                results.append(('grid', result2))
            
            # Estrategia 3: Por umbral y componentes conectados
            result3 = self._detect_by_threshold(image, gray, num_questions)
            if result3 and result3.get('answers'):
                results.append(('threshold', result3))

            # Liberar memoria de la imagen
            del image, gray
            gc.collect()

            if not results:
                return {
                    'answers': [],
                    'confidence': 0,
                    'error': 'No se detectaron burbujas en la imagen',
                    'method': 'none'
                }

            # Elegir el mejor resultado
            best_method, best_result = max(results, key=lambda r: (
                len(r[1].get('answers', [])),
                r[1].get('confidence', 0)
            ))

            best_result['method'] = best_method
            print(f"[BubbleDetector] Mejor método: {best_method} con {len(best_result['answers'])} respuestas")
            
            return best_result

        except Exception as e:
            print(f"[BubbleDetector] Error: {str(e)}")
            import traceback
            traceback.print_exc()
            gc.collect()
            return {'answers': [], 'confidence': 0, 'error': str(e)}

    def _preprocess_image(self, gray: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Preprocesa la imagen para detección de burbujas."""
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Umbral adaptativo
        thresh_adaptive = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 11, 2
        )
        
        # Umbral Otsu
        _, thresh_otsu = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
        
        del blurred
        return thresh_adaptive, thresh_otsu

    def _detect_by_contours(self, image: np.ndarray, gray: np.ndarray, 
                            num_questions: int = None) -> Optional[Dict]:
        """Detección mediante contornos circulares."""
        try:
            thresh_adaptive, thresh_otsu = self._preprocess_image(gray)
            
            all_bubbles = []
            
            for thresh_name, thresh in [('adaptive', thresh_adaptive), ('otsu', thresh_otsu)]:
                contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                img_area = image.shape[0] * image.shape[1]
                min_area = img_area * 0.0005
                max_area = img_area * 0.03
                
                bubbles = []
                for contour in contours:
                    area = cv2.contourArea(contour)
                    perimeter = cv2.arcLength(contour, True)
                    
                    if perimeter == 0 or area < min_area or area > max_area:
                        continue
                    
                    circularity = 4 * np.pi * area / (perimeter * perimeter)
                    x, y, w, h = cv2.boundingRect(contour)
                    aspect_ratio = w / h if h > 0 else 0
                    
                    if (0.4 < circularity < 1.3 and 0.4 < aspect_ratio < 2.5):
                        M = cv2.moments(contour)
                        if M["m00"] != 0:
                            cx = int(M["m10"] / M["m00"])
                            cy = int(M["m01"] / M["m00"])
                        else:
                            cx, cy = x + w // 2, y + h // 2
                        
                        # Calcular llenado usando la región del bounding box
                        # Más eficiente que crear una máscara del tamaño de toda la imagen
                        roi = gray[y:y+h, x:x+w]
                        mean_val = np.mean(roi) if roi.size > 0 else 255
                        fill_ratio = 1 - (mean_val / 255)
                        
                        bubbles.append({
                            'x': cx, 'y': cy,
                            'w': w, 'h': h,
                            'area': area,
                            'circularity': circularity,
                            'fill_ratio': fill_ratio
                        })
                
                if len(bubbles) > len(all_bubbles):
                    all_bubbles = bubbles

            del thresh_adaptive, thresh_otsu

            if len(all_bubbles) < 3:
                return None

            answers = self._group_bubbles_into_answers(all_bubbles, num_questions)
            
            if not answers:
                return None

            confidences = [a.get('confidence', 0) for a in answers]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0

            return {
                'answers': answers,
                'confidence': avg_confidence,
                'total_bubbles': len(all_bubbles),
                'method': 'contours'
            }

        except Exception as e:
            print(f"[BubbleDetector] Error en detección por contornos: {e}")
            return None

    def _detect_by_grid(self, image: np.ndarray, gray: np.ndarray,
                        num_questions: int = None) -> Optional[Dict]:
        """Detección por análisis de cuadrícula."""
        try:
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
            del blurred
            
            h, w = thresh.shape
            
            # Detectar región con contenido
            row_sums = np.sum(thresh, axis=1) / 255
            col_sums = np.sum(thresh, axis=0) / 255
            
            row_threshold = np.max(row_sums) * 0.1
            col_threshold = np.max(col_sums) * 0.1
            
            rows_with_content = np.where(row_sums > row_threshold)[0]
            cols_with_content = np.where(col_sums > col_threshold)[0]
            
            if len(rows_with_content) < 2 or len(cols_with_content) < 2:
                return None
            
            y_start = rows_with_content[0]
            y_end = rows_with_content[-1]
            x_start = cols_with_content[0]
            x_end = cols_with_content[-1]
            
            roi = thresh[y_start:y_end, x_start:x_end]
            roi_gray = gray[y_start:y_end, x_start:x_end]
            roi_h, roi_w = roi.shape
            
            if roi_h < 20 or roi_w < 20:
                return None
            
            # Proyección horizontal para encontrar filas
            h_proj = np.sum(roi, axis=1) / 255
            
            kernel_size = max(3, roi_h // 50)
            if kernel_size % 2 == 0:
                kernel_size += 1
            h_proj_smooth = np.convolve(h_proj, np.ones(kernel_size)/kernel_size, mode='same')
            
            # Encontrar picos (filas de burbujas)
            peak_threshold = np.mean(h_proj_smooth) + np.std(h_proj_smooth) * 0.3
            
            in_peak = False
            peaks = []
            peak_start = 0
            
            for i in range(len(h_proj_smooth)):
                if h_proj_smooth[i] > peak_threshold and not in_peak:
                    in_peak = True
                    peak_start = i
                elif h_proj_smooth[i] <= peak_threshold and in_peak:
                    in_peak = False
                    peak_center = (peak_start + i) // 2
                    peak_height = i - peak_start
                    peaks.append({'center': peak_center, 'start': peak_start, 
                                'end': i, 'height': peak_height})
            
            if in_peak:
                peak_center = (peak_start + len(h_proj_smooth) - 1) // 2
                peaks.append({'center': peak_center, 'start': peak_start,
                            'end': len(h_proj_smooth) - 1, 'height': len(h_proj_smooth) - peak_start})
            
            # Filtrar filas delgadas
            if peaks:
                median_height = np.median([p['height'] for p in peaks])
                peaks = [p for p in peaks if p['height'] > median_height * 0.3]
            
            # Clasificar filas de burbujas vs letras
            bubble_rows = []
            if len(peaks) >= 2:
                heights = [p['height'] for p in peaks]
                median_h = np.median(heights)
                for p in peaks:
                    if p['height'] >= median_h * 0.5:
                        bubble_rows.append(p)
            
            if not bubble_rows:
                bubble_rows = peaks
            
            if len(bubble_rows) < 1:
                return None
            
            # Analizar cada fila
            answers = []
            num_opts = self.num_options
            
            for q_idx, row in enumerate(bubble_rows):
                row_slice = roi_gray[row['start']:row['end'], :]
                
                if row_slice.shape[0] < 3 or row_slice.shape[1] < 3:
                    continue
                
                col_width = roi_w // num_opts
                
                darkest_col = -1
                darkest_val = 255
                fill_ratios = []
                
                for opt_idx in range(num_opts):
                    x1 = opt_idx * col_width
                    x2 = min((opt_idx + 1) * col_width, roi_w)
                    cell = row_slice[:, x1:x2]
                    
                    if cell.size == 0:
                        fill_ratios.append(0)
                        continue
                    
                    mean_val = np.mean(cell)
                    fill_ratio = 1 - (mean_val / 255)
                    fill_ratios.append(fill_ratio)
                    
                    if mean_val < darkest_val:
                        darkest_val = mean_val
                        darkest_col = opt_idx
                
                if darkest_col >= 0 and fill_ratios:
                    max_fill = max(fill_ratios)
                    second_max = sorted(fill_ratios, reverse=True)[1] if len(fill_ratios) > 1 else 0
                    
                    if max_fill > 0.15 and (max_fill - second_max) > 0.05:
                        confidence = min(100, (max_fill - second_max) / max_fill * 100)
                        answers.append({
                            'pregunta': q_idx + 1,
                            'respuesta': self.options[darkest_col],
                            'confidence': confidence,
                            'fill_ratio': max_fill,
                            'match': f"Q{q_idx + 1}: {self.options[darkest_col]}"
                        })

            del roi, roi_gray, thresh
            
            if not answers:
                return None

            avg_confidence = sum(a['confidence'] for a in answers) / len(answers)
            
            return {
                'answers': answers,
                'confidence': avg_confidence,
                'total_rows': len(bubble_rows),
                'method': 'grid'
            }

        except Exception as e:
            print(f"[BubbleDetector] Error en detección por cuadrícula: {e}")
            return None

    def _detect_by_threshold(self, image: np.ndarray, gray: np.ndarray,
                             num_questions: int = None) -> Optional[Dict]:
        """Detección por umbral y componentes conectados."""
        try:
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
            del blurred
            
            # Operaciones morfológicas
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
            thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=1)
            
            # Componentes conectados
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(thresh, 8)
            del thresh
            
            img_area = image.shape[0] * image.shape[1]
            min_area = img_area * 0.0003
            max_area = img_area * 0.04
            
            candidates = []
            for i in range(1, num_labels):
                area = stats[i, cv2.CC_STAT_AREA]
                w = stats[i, cv2.CC_STAT_WIDTH]
                h_val = stats[i, cv2.CC_STAT_HEIGHT]
                x = stats[i, cv2.CC_STAT_LEFT]
                y = stats[i, cv2.CC_STAT_TOP]
                cx, cy = centroids[i]
                
                if w == 0 or h_val == 0:
                    continue
                    
                aspect_ratio = w / h_val
                fill_density = area / (w * h_val) if (w * h_val) > 0 else 0
                
                if (min_area < area < max_area and
                    0.3 < aspect_ratio < 3.0 and
                    fill_density > 0.3):
                    
                    # Calcular oscuridad promedio usando el bounding box
                    roi = gray[y:y+h_val, x:x+w]
                    mean_gray = np.mean(roi) if roi.size > 0 else 255
                    darkness = 1 - (mean_gray / 255)
                    
                    candidates.append({
                        'x': int(cx), 'y': int(cy),
                        'w': w, 'h': h_val,
                        'area': area,
                        'fill_density': fill_density,
                        'darkness': darkness,
                    })
            
            del labels, stats, centroids
            
            if len(candidates) < 3:
                return None
            
            areas = [c['area'] for c in candidates]
            median_area = np.median(areas)
            
            similar_candidates = [c for c in candidates 
                                 if 0.3 * median_area < c['area'] < 3.0 * median_area]
            
            if len(similar_candidates) < 3:
                similar_candidates = candidates
            
            answers = self._group_bubbles_into_answers(similar_candidates, num_questions)
            
            if not answers:
                return None
            
            avg_confidence = sum(a.get('confidence', 0) for a in answers) / len(answers)
            
            return {
                'answers': answers,
                'confidence': avg_confidence,
                'total_candidates': len(similar_candidates),
                'method': 'threshold'
            }
            
        except Exception as e:
            print(f"[BubbleDetector] Error en detección por umbral: {e}")
            return None

    def _group_bubbles_into_answers(self, bubbles: List[Dict], 
                                     num_questions: int = None) -> List[Dict]:
        """
        Agrupa las burbujas detectadas en filas (preguntas) y determina 
        cuál está marcada en cada fila.
        """
        if not bubbles:
            return []
        
        bubbles_sorted = sorted(bubbles, key=lambda b: b['y'])
        
        # Agrupar por filas
        rows = []
        current_row = [bubbles_sorted[0]]
        
        avg_height = np.mean([b.get('h', 20) for b in bubbles])
        y_tolerance = avg_height * 0.8
        
        for bubble in bubbles_sorted[1:]:
            if abs(bubble['y'] - current_row[-1]['y']) < y_tolerance:
                current_row.append(bubble)
            else:
                rows.append(current_row)
                current_row = [bubble]
        rows.append(current_row)
        
        answers = []
        
        row_sizes = [len(row) for row in rows]
        if not row_sizes:
            return []
            
        most_common_size = max(set(row_sizes), key=row_sizes.count)
        
        question_num = 0
        for row in rows:
            if len(row) < 2:
                continue
            if len(row) > len(self.options) + 2:
                continue
            
            row_sorted = sorted(row, key=lambda b: b['x'])
            question_num += 1
            
            # Encontrar la burbuja más oscura/llena
            darkest = None
            darkest_score = -1
            
            for i, bubble in enumerate(row_sorted):
                score = bubble.get('fill_ratio', bubble.get('darkness', bubble.get('fill_density', 0)))
                if score > darkest_score:
                    darkest_score = score
                    darkest = (i, bubble)
            
            if darkest is not None:
                opt_idx, bubble = darkest
                
                all_scores = [b.get('fill_ratio', b.get('darkness', b.get('fill_density', 0))) 
                             for b in row_sorted]
                
                if len(all_scores) > 1:
                    sorted_scores = sorted(all_scores, reverse=True)
                    gap = sorted_scores[0] - sorted_scores[1]
                    
                    if gap < 0.02 and darkest_score < 0.3:
                        continue
                    
                    confidence = min(100, max(30, gap / (sorted_scores[0] + 0.01) * 100))
                else:
                    confidence = 50 if darkest_score > 0.3 else 20
                
                if opt_idx < len(self.options):
                    option_letter = self.options[opt_idx]
                else:
                    option_letter = self.options[-1]
                
                answers.append({
                    'pregunta': question_num,
                    'respuesta': option_letter,
                    'confidence': confidence,
                    'fill_ratio': darkest_score,
                    'match': f"Q{question_num}: {option_letter}"
                })
        
        return answers

    def is_bubble_sheet(self, image_path: str) -> bool:
        """
        Determina si una imagen es una hoja de burbujas o texto normal.
        """
        try:
            image = cv2.imread(image_path)
            if image is None:
                return False
            
            # Redimensionar para ahorrar memoria
            image = self._resize_for_processing(image)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
            del blurred
            
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            del thresh
            
            img_area = image.shape[0] * image.shape[1]
            min_area = img_area * 0.0005
            max_area = img_area * 0.03
            
            circular_count = 0
            total_valid = 0
            
            for contour in contours:
                area = cv2.contourArea(contour)
                perimeter = cv2.arcLength(contour, True)
                
                if perimeter == 0 or area < min_area or area > max_area:
                    continue
                
                total_valid += 1
                circularity = 4 * np.pi * area / (perimeter * perimeter)
                
                if 0.5 < circularity < 1.3:
                    circular_count += 1
            
            del image, gray
            gc.collect()
            
            if total_valid > 0:
                circular_ratio = circular_count / total_valid
                return circular_ratio > 0.3 and circular_count >= 5
            
            return False
            
        except Exception as e:
            print(f"[BubbleDetector] Error en is_bubble_sheet: {e}")
            return False


def detect_bubble_answers(image_path: str, options: List[str] = None, 
                          num_questions: int = None) -> Dict:
    """Función de conveniencia para detectar respuestas."""
    detector = BubbleDetector(options=options)
    return detector.detect_answers(image_path, num_questions)
