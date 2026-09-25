# 24 STREET

Tienda visual de 24 STREET. Las páginas de la tienda y sus recursos estáticos viven en `public/`; la ruta de Next.js redirige `/` a `/index.html` para servir esa Home al entrar al dominio.

## Desarrollo local

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Comprobaciones disponibles:

```bash
pnpm typecheck
pnpm check:site
pnpm build
pnpm start
```

## Publicación

1. Crea un repositorio GitHub vacío.
2. Si Git todavía no tiene la autoría configurada, define estos datos para este repositorio y crea el primer commit:

   ```bash
   git config user.name "Tu nombre"
   git config user.email "tu-correo-de-github"
   git add -A
   git commit -m "Prepare 24 STREET for deployment"
   ```

3. Enlaza el remoto y sube la rama `main`:

   ```bash
   git remote add origin https://github.com/<usuario>/24-street.git
   git push -u origin main
   ```

4. Para un hosting compatible con Next.js, conecta ese repositorio. Usa `pnpm install --frozen-lockfile` para instalar dependencias y `pnpm build` para compilar. El hosting debe servir la aplicación en la raíz del dominio.
5. Para un hosting estático, publica el contenido de `public/` como raíz del sitio y conserva su estructura de subcarpetas, en especial `marcas/` y `assets/`.

No se requieren variables de entorno. La tienda carga imágenes desde Unsplash, logos desde Simple Icons/Clearbit, el video principal desde Pexels y las fuentes desde Google Fonts; el hosting debe permitir esos recursos externos.
