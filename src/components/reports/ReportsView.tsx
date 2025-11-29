import { useState, useEffect, useMemo } from 'react';
import { getMealsReport, type MealReport } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Download, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useSearchParams } from 'react-router-dom';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const ReportsView = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<MealReport[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { toast } = useToast();

  const employeeFilter = searchParams.get('employee');

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(start.toISOString().slice(0, 16));
    setEndDate(now.toISOString().slice(0, 16));

    if (employeeFilter) {
      handleGenerate(start.getTime(), now.getTime(), employeeFilter);
    }
  }, [employeeFilter]);

  const handleGenerate = async (customStart?: number, customEnd?: number, assetId?: string) => {
    const start = customStart || new Date(startDate).getTime();
    const end = customEnd || new Date(endDate).getTime();

    if (!start || !end) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione as datas de início e fim.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await getMealsReport(start, end, assetId);
      setReports(response.data);
      toast({
        title: 'Sucesso',
        description: `${response.data.length} registros encontrados.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao gerar relatório.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart: Meals by Sector
  const mealsBySector = useMemo(() => {
    const sectors: Record<string, number> = {};
    reports.forEach((r) => {
      const sector = r.employee_setor || 'Sem Setor';
      sectors[sector] = (sectors[sector] || 0) + 1;
    });
    return sectors;
  }, [reports]);

  const pieData = {
    labels: Object.keys(mealsBySector),
    datasets: [
      {
        label: 'Refeições',
        data: Object.values(mealsBySector),
        backgroundColor: [
          'hsl(160, 84%, 45%)',
          'hsl(180, 84%, 50%)',
          'hsl(200, 84%, 55%)',
          'hsl(220, 84%, 60%)',
          'hsl(240, 84%, 65%)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Chart: Meals by Day
  const mealsByDay = useMemo(() => {
    const days: Record<string, number> = {};
    reports.forEach((r) => {
      const date = new Date(r.timestamp).toLocaleDateString('pt-BR');
      days[date] = (days[date] || 0) + 1;
    });
    return days;
  }, [reports]);

  const barData = {
    labels: Object.keys(mealsByDay),
    datasets: [
      {
        label: 'Total de Refeições',
        data: Object.values(mealsByDay),
        backgroundColor: 'hsl(160, 84%, 45%)',
        borderRadius: 8,
      },
    ],
  };

  // Today's meals count
  const todayMeals = useMemo(() => {
    const today = new Date().toLocaleDateString('pt-BR');
    return reports.filter((r) => new Date(r.timestamp).toLocaleDateString('pt-BR') === today).length;
  }, [reports]);

  // Weekly meals count (last 7 days)
  const weeklyMeals = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return reports.filter((r) => new Date(r.timestamp) >= weekAgo).length;
  }, [reports]);

  // Monthly meals count (current month)
  const monthlyMeals = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    return reports.filter((r) => {
      const date = new Date(r.timestamp);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
  }, [reports]);

  // Export to CSV
  const handleExportCSV = () => {
    if (reports.length === 0) {
      toast({
        title: 'Erro',
        description: 'Não há dados para exportar.',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['Funcionário', 'Setor', 'Tipo de Refeição', 'Data e Hora'];
    const rows = reports.map((r) => [
      r.employee_name,
      r.employee_setor || '-',
      r.meal_type,
      new Date(r.timestamp).toLocaleString('pt-BR'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-refeicoes-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Sucesso',
      description: 'Relatório exportado com sucesso.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">Visualize e analise o histórico de refeições</p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start">Data de Início</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="start"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">Data de Fim</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="end"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <Button onClick={() => handleGenerate()} disabled={loading} className="flex-1 md:flex-none">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar Relatório Geral
          </Button>
          <Button
            onClick={handleExportCSV}
            disabled={loading || reports.length === 0}
            variant="outline"
            className="flex-1 md:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Total */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Diário</p>
                <p className="text-4xl font-bold text-primary">{todayMeals}</p>
                <p className="text-xs text-muted-foreground mt-1">Hoje</p>
              </div>
              <div className="bg-primary/20 rounded-full p-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          {/* Weekly Total */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Semanal</p>
                <p className="text-4xl font-bold text-blue-500">{weeklyMeals}</p>
                <p className="text-xs text-muted-foreground mt-1">Últimos 7 dias</p>
              </div>
              <div className="bg-blue-500/20 rounded-full p-4">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Monthly Total */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Mensal</p>
                <p className="text-4xl font-bold text-purple-500">{monthlyMeals}</p>
                <p className="text-xs text-muted-foreground mt-1">Mês atual</p>
              </div>
              <div className="bg-purple-500/20 rounded-full p-4">
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Refeições por Setor</h3>
            <div className="flex items-center justify-center" style={{ height: '300px' }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: 'hsl(160, 5%, 98%)' } } } }} />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Total de Refeições por Dia</h3>
            <div style={{ height: '300px' }}>
              <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: 'hsl(160, 5%, 98%)' } } }, scales: { x: { ticks: { color: 'hsl(160, 5%, 60%)' } }, y: { ticks: { color: 'hsl(160, 5%, 60%)' } } } }} />
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {reports.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold">Dados Brutos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Funcionário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Setor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Data e Hora
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm">{r.employee_name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{r.employee_setor || '-'}</td>
                    <td className="px-6 py-4 text-sm">{r.meal_type}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(r.timestamp).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Nenhum registro encontrado. Gere um relatório para visualizar os dados.</p>
        </div>
      )}
    </div>
  );
};
