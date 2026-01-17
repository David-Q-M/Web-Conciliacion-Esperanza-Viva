import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // 1. Obtener el usuario autenticado del LocalStorage
    const userJson = localStorage.getItem('currentUser');
    let token = '';

    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            token = user.token || ''; // Asegúrate de que tu objeto usuario tenga esta propiedad
        } catch (e) {
            console.error("Error al leer usuario del storage", e);
        }
    }

    // 2. Si existe el token, clonar la solicitud y añadir el header Authorization
    if (token) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq);
    }

    // 3. Si no hay token, pasar la solicitud tal cual
    return next(req);
};
