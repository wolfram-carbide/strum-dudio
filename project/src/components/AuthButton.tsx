import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AuthButton() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-2 text-sm text-navy-800">
        <User size={16} />
        <span className="font-medium">{user.email}</span>
      </div>
    );
  }

  return null;
}
