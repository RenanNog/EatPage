import { useState, useEffect } from 'react';
import { createEmployee, updateEmployee, type Employee } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee?: Employee;
}

export const EmployeeModal = ({ open, onClose, onSuccess, employee }: EmployeeModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    fingerprint_id: '',
    setor: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (employee) {
      setFormData({
        nome: employee.nome,
        matricula: employee.matricula,
        fingerprint_id: employee.fingerprint_id || '',
        setor: employee.setor || '',
      });
    } else {
      setFormData({
        nome: '',
        matricula: '',
        fingerprint_id: '',
        setor: '',
      });
    }
  }, [employee, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        nome: formData.nome,
        matricula: formData.matricula,
        fingerprint_id: formData.fingerprint_id || null,
        setor: formData.setor || null,
      };

      if (employee) {
        await updateEmployee(employee.id, data);
        toast({
          title: 'Sucesso',
          description: 'Funcionário atualizado com sucesso!',
        });
      } else {
        await createEmployee(data);
        toast({
          title: 'Sucesso',
          description: 'Funcionário criado com sucesso!',
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Ocorreu um erro ao salvar o funcionário.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{employee ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              placeholder="Nome completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="matricula">Matrícula *</Label>
            <Input
              id="matricula"
              value={formData.matricula}
              onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
              required
              placeholder="Número de matrícula"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fingerprint">ID Biométrico</Label>
            <Input
              id="fingerprint"
              value={formData.fingerprint_id}
              onChange={(e) => setFormData({ ...formData, fingerprint_id: e.target.value })}
              placeholder="ID da impressão digital"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setor">Setor</Label>
            <Input
              id="setor"
              value={formData.setor}
              onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
              placeholder="Departamento ou setor"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {employee ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
