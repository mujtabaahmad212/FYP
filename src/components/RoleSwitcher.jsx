import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RoleSwitcher = () => {
  const { user, originalRole, switchRole, resetRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    if (e.target.value === originalRole) {
      resetRole();
    } else {
      switchRole(e.target.value);
    }
  };

  if (!user) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
        <h4 className="text-lg font-bold mb-2">Role Switcher</h4>
        <p className="text-xs text-gray-500 mt-2 mb-2">Log in to switch roles.</p>
        <button
          onClick={() => navigate('/login')}
          className="w-full mt-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    );
  }

  const isSwitchingAllowed = originalRole === 'admin';

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h4 className="text-lg font-bold mb-2">Role Switcher</h4>
      <select
        value={user.role}
        onChange={handleRoleChange}
        className="w-full p-2 border rounded-md"
        disabled={!isSwitchingAllowed}
      >
        <option value="admin">Admin</option>
        <option value="officer">Officer</option>
        <option value="viewer">Viewer</option>
        <option value="guest">Guest</option>
      </select>
      {!isSwitchingAllowed && (
        <p className="text-xs text-gray-500 mt-2">Log in as admin to switch roles.</p>
      )}
      {isSwitchingAllowed && user.role !== originalRole && (
        <button
          onClick={resetRole}
          className="w-full mt-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Reset to Admin
        </button>
      )}
    </div>
  );
};

export default RoleSwitcher;
