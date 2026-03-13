#include <stdio.h>

int main() {
    char nombre[50];
    int nacimiento, edad;
    int actual = 2025;

    for (int i = 1; i <= 100; i++) {
        printf("\nAtleta %d:\n", i);
        printf("  Ingrese el nombre: ");
        scanf("%s", nombre);

        printf("  Ingrese el año de nacimiento: ");
        scanf("%d", &nacimiento);

        edad = actual - nacimiento;
        printf("  %s tiene %d años.\n", nombre, edad);
    }

    return 0;
}
