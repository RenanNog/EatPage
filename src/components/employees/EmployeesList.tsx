import { useState, useEffect, useMemo } from 'react';
import { getEmployees, type Employee } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical, Loader2 } from 'lucide-react';
import { EmployeeModal } from './EmployeeModal';
import { EmployeeOptionsModal } from './EmployeeOptionsModal';
import { useToast } from '@/hooks/use-toast';

export const EmployeesList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchMatricula, setSearchMatricula] = useState('');
  const [searchSetor, setSearchSetor] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [optionsEmployee, setOptionsEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const itemsPerPage = 15;

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployees();
      setEmployees(response.data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os funcionários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Filtros client-side
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchName = emp.nome.toLowerCase().includes(searchName.toLowerCase());
      const matchMatricula = emp.matricula.toLowerCase().includes(searchMatricula.toLowerCase());
      const matchSetor = emp.setor?.toLowerCase().includes(searchSetor.toLowerCase()) ?? true;
      return matchName && matchMatricula && matchSetor;
    });
  }, [employees, searchName, searchMatricula, searchSetor]);

  // Paginação
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchMatricula, searchSetor]);

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setOptionsEmployee(null);
  };

  const handleSuccess = () => {
    loadEmployees();
    setIsCreateModalOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie os funcionários cadastrados</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Funcionário
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por matrícula..."
            value={searchMatricula}
            onChange={(e) => setSearchMatricula(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por setor..."
            value={searchSetor}
            onChange={(e) => setSearchSetor(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Matrícula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Setor
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {emp.matricula}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{emp.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {emp.setor || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOptionsEmployee(emp)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} -{' '}
                  {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} de{' '}
                  {filteredEmployees.length} funcionários
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <EmployeeModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />
      <EmployeeModal
        open={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSuccess={handleSuccess}
        employee={editingEmployee || undefined}
      />
      <EmployeeOptionsModal
        open={!!optionsEmployee}
        onClose={() => setOptionsEmployee(null)}
        employee={optionsEmployee}
        onEdit={handleEdit}
        onDelete={handleSuccess}
      />
    </div>
  );
};
