#!/bin/bash

OUTPUT="notas-redtetris.txt"
SCRIPT_NAME="$(basename "$0")"

{
	echo "========================================"
	echo "ESTRUCTURA DEL PROYECTO"
	echo "========================================"
	echo

	tree -a -I ".git|node_modules|dist|coverage|.gitkeep|package-lock.json|.env|$OUTPUT|$SCRIPT_NAME"

	echo
	echo
	echo "========================================"
	echo "CONTENIDO DE LOS ARCHIVOS"
	echo "========================================"

	find . \
		-path "./.git" -prune -o \
		-path "*/node_modules" -prune -o \
		-path "*/dist" -prune -o \
		-path "*/coverage" -prune -o \
		-path "./client/public" -prune -o \
		-path "./client/src/assets" -prune -o \
		-type f \
		! -name "$OUTPUT" \
		! -name "$SCRIPT_NAME" \
		! -name ".env" \
		! -name ".gitkeep" \
		! -name "package-lock.json" \
		! -name "subject.txt" \
		-print0 |
	sort -z |
	while IFS= read -r -d '' file; do

		# Saltar ficheros binarios
		grep -qI . "$file" || continue

		echo
		echo "========================================"
		echo "ARCHIVO: $file"
		echo "========================================"
		echo

		cat "$file"

	done

} > "$OUTPUT"

echo "Archivo $OUTPUT generado correctamente."