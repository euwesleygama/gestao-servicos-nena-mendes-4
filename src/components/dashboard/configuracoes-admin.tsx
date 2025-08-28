import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataMigration from "@/components/migration/data-migration";
import { Settings, Database } from "lucide-react";

export default function ConfiguracoesAdmin() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Configurações do sistema e migração de dados</p>
        </div>
      </div>

      {/* Migração de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migração de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataMigration />
        </CardContent>
      </Card>

      {/* Outras Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Outras configurações do sistema serão adicionadas aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}