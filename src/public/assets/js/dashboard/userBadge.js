document.addEventListener('DOMContentLoaded', () => {
	const nameEl = document.getElementById('sidebarUserName');
	const roleEl = document.getElementById('sidebarUserRole');
	const avatarEl = document.getElementById('sidebarUserAvatar');

	if (!nameEl && !roleEl && !avatarEl) return;

	const safeJSONParse = (value) => {
		try {
			return JSON.parse(value);
		} catch (_) {
			return null;
		}
	};

	const user = safeJSONParse(localStorage.getItem('user'));
	const role = safeJSONParse(localStorage.getItem('role'));
	const token = localStorage.getItem('token');

	const decodeJWTPayload = (jwtToken) => {
		if (!jwtToken || typeof jwtToken !== 'string') return null;
		const parts = jwtToken.split('.');
		if (parts.length !== 3) return null;
		try {
			const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
			const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
			const json = decodeURIComponent(
				atob(padded)
					.split('')
					.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
					.join('')
			);
			return JSON.parse(json);
		} catch (_) {
			return null;
		}
	};

	const tokenPayload = decodeJWTPayload(token);

	const userNameFromStorage = user && (user.User_name || user.name || user.username);
	const userEmailFromStorage = user && (user.User_email || user.email);
	const nameFromToken = tokenPayload && (tokenPayload.name || tokenPayload.User_name);
	const emailFromToken = tokenPayload && (tokenPayload.email || tokenPayload.User_email);

	const displayName = userNameFromStorage || nameFromToken || userEmailFromStorage || emailFromToken || 'Sesión activa';

	const roleName =
		(role && (role.name || role.Roles_name)) ||
		(user && (user.role || user.Roles_name)) ||
		'';

	const computeInitials = (text) => {
		if (!text) return 'UA';
		const cleaned = String(text).trim();
		if (!cleaned) return 'UA';
		const parts = cleaned.split(/\s+/).filter(Boolean);
		const first = parts[0]?.[0] || '';
		const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : (cleaned[1] || '');
		const initials = (first + second).toUpperCase().replace(/[^A-Z0-9]/g, '');
		return initials || 'UA';
	};

	if (nameEl) {
		nameEl.textContent = 'Sesión activa';
		nameEl.hidden = false;
	}
	if (roleEl) roleEl.textContent = roleName;
	if (avatarEl) {
		const avatarSource = userNameFromStorage || nameFromToken || userEmailFromStorage || emailFromToken;
		avatarEl.textContent = computeInitials(avatarSource);
	}
});
