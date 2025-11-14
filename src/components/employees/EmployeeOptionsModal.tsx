import { useState } from 'react';
import { deleteEmployee, type Employee, api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Utensils, Lock, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmployeeOptionsModalProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEdit: (employee: Employee) => void;
  onDelete: () => void;
}

export const EmployeeOptionsModal = ({
  open,
  onClose,
  employee,
  onEdit,
  onDelete,
}: EmployeeOptionsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showMealPasswordInput, setShowMealPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [mealPassword, setMealPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!employee) return null;

  const handleRegisterMeal = async () => {
    if (!mealPassword) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira a senha de refeição.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/employees/${employee.id}/register-meal`, {
        meal_type: 'Refeição',
        password: mealPassword
      });
      toast({
        title: 'Sucesso',
        description: 'Refeição registrada com sucesso!',
      });
      setMealPassword('');
      setShowMealPasswordInput(false);
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao registrar refeição.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!password) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira uma senha.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/employees/${employee.id}/set-password`, { password });
      toast({
        title: 'Sucesso',
        description: 'Senha de refeição definida com sucesso!',
      });
      setPassword('');
      setShowPasswordInput(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao definir senha.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Deseja realmente excluir ${employee.nome}?`)) return;

    setLoading(true);
    try {
      await deleteEmployee(employee.id);
      toast({
        title: 'Sucesso',
        description: 'Funcionário excluído com sucesso!',
      });
      onDelete();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao excluir funcionário.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualReport = () => {
    navigate(`/reports?employee=${employee.id}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Opções - {employee.nome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nome:</span>
                <p className="font-medium">{employee.nome}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Matrícula:</span>
                <p className="font-medium">{employee.matricula}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Setor:</span>
                <p className="font-medium">{employee.setor || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">ID Biométrico:</span>
                <p className="font-medium">{employee.fingerprint_id || '-'}</p>
              </div>
            </div>
          </div>

          {/* Register Meal */}
          <div className="space-y-2">
            {showMealPasswordInput ? (
              <div className="space-y-2">
                <Label>Senha de Refeição</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Digite a senha..."
                    value={mealPassword}
                    onChange={(e) => setMealPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegisterMeal()}
                  />
                  <Button onClick={handleRegisterMeal} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowMealPasswordInput(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowMealPasswordInput(true)}
              >
                <Utensils className="mr-2 h-4 w-4" />
                Registrar Refeição
              </Button>
            )}
          </div>

          {/* Set Password */}
          <div className="space-y-2">
            {showPasswordInput ? (
              <div className="space-y-2">
                <Label>Nova Senha de Refeição</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Digite a nova senha..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSetPassword()}
                  />
                  <Button onClick={handleSetPassword} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowPasswordInput(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowPasswordInput(true)}
              >
                <Lock className="mr-2 h-4 w-4" />
                Definir Senha de Refeição
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onEdit(employee);
                onClose();
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="outline" onClick={handleIndividualReport}>
              <FileText className="mr-2 h-4 w-4" />
              Relatório Individual
            </Button>
          </div>

          <Button variant="destructive" className="w-full" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Excluir Funcionário
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
