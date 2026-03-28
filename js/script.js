// ==================== ADMIN MANAGEMENT UI ====================

// Display admins list
async function displayAdminsList() {
    const adminsContainer = document.getElementById('adminsList');
    if (!adminsContainer) return;
    
    const admins = await getAdminsList();
    const currentAdmin = getCurrentAdmin();
    
    adminsContainer.innerHTML = admins.map(admin => `
        <div class="admin-card">
            <div class="admin-card-header">
                <i class="fas fa-user-circle"></i>
                <h5>${escapeHtml(admin.displayName)}</h5>
            </div>
            <div><small>@${escapeHtml(admin.username)}</small></div>
            <div><small>${escapeHtml(admin.email)}</small></div>
            <div class="admin-card-role role-${admin.role}">${admin.role === 'super_admin' ? '👑 Super Admin' : '👤 Admin'}</div>
            ${currentAdmin?.role === 'super_admin' && admin.id !== currentAdmin?.id ? `
                <div class="admin-card-actions">
                    <button class="btn-danger" onclick="handleDeleteAdmin(${admin.id})">Delete</button>
                    <button class="btn-warning" onclick="handleResetAdminPassword(${admin.id})">Reset Password</button>
                </div>
            ` : ''}
            ${admin.id === currentAdmin?.id ? '<small><i class="fas fa-check-circle"></i> You</small>' : ''}
        </div>
    `).join('');
}

// Handle add admin
async function handleAddAdmin(e) {
    e.preventDefault();
    
    const username = document.getElementById('newAdminUsername').value.trim();
    const email = document.getElementById('newAdminEmail').value.trim();
    const password = document.getElementById('newAdminPassword').value;
    const displayName = document.getElementById('newAdminDisplayName').value.trim();
    const role = document.getElementById('newAdminRole').value;
    
    if (!username || !email || !password || !displayName) {
        showToast("Please fill in all fields!", true);
        return;
    }
    
    const result = await addAdmin({ username, email, password, displayName, role });
    
    if (result.success) {
        showToast(result.message);
        document.getElementById('addAdminForm').reset();
        await displayAdminsList();
    } else {
        showToast(result.message, true);
    }
}

// Handle delete admin
async function handleDeleteAdmin(adminId) {
    if (confirm("Are you sure you want to delete this admin?")) {
        const result = await deleteAdmin(adminId);
        if (result.success) {
            showToast(result.message);
            await displayAdminsList();
        } else {
            showToast(result.message, true);
        }
    }
}

// Handle reset password
async function handleResetAdminPassword(adminId) {
    const newPassword = prompt("Enter new password:");
    if (newPassword && newPassword.length >= 4) {
        const result = await updateAdmin(adminId, { password: newPassword });
        if (result.success) {
            showToast("Password reset successfully!");
        } else {
            showToast(result.message, true);
        }
    } else if (newPassword) {
        showToast("Password must be at least 4 characters!", true);
    }
}

// Initialize admin management
async function initAdminManagement() {
    await displayAdminsList();
    
    const addAdminForm = document.getElementById('addAdminForm');
    if (addAdminForm) {
        addAdminForm.addEventListener('submit', handleAddAdmin);
    }
}