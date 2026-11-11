import React, { useState } from 'react';
import { Database, ShieldCheck, FileCode, Check, Copy, Layers, Server } from 'lucide-react';
import { FIRESTORE_ARCHITECTURE } from '../services/firestoreModelDoc';

export const FirestoreArchitectureView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div id="firestore-arch-container" className="space-y-5 pb-24 text-[#E8F4F8]">
      {/* Header */}
      <div className="p-4 bg-[#082F52] border border-[#14527A] rounded-2xl shadow-md space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FFAA00]/15 text-[#FFAA00] border border-[#FFAA00]/25">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#E8F4F8]">
              Modelagem NoSQL & Arquitetura Firestore
            </h2>
            <p className="text-xs text-[#8FAFBD]">
              Especificação sênior de coleções, subcoleções, regras ABAC e justificativa de engenharia
            </p>
          </div>
        </div>
      </div>

      {/* Senior Architect Key Decision: Why Separate Routines vs Logs? */}
      <div className="p-4 bg-[#082F52] border border-[#FFAA00]/30 rounded-2xl shadow-md space-y-3">
        <div className="flex items-center gap-2 text-[#FFAA00] text-sm font-extrabold">
          <Layers className="w-4 h-4" />
          <span>Decisão Arquitetural: Treinos Fixos (A, B, C) vs. Logs Históricos</span>
        </div>
        <p className="text-xs text-[#8FAFBD] leading-relaxed">
          Para atender à solicitação de como separar a ficha prescrita do registro diário de cargas, adotamos uma arquitetura desacoplada em duas subcoleções independentes sob o escopo do usuário:
        </p>

        <div className="space-y-2.5 pt-1">
          {FIRESTORE_ARCHITECTURE.seniorArchitectAnalysis.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#031F38] border border-[#14527A] text-xs text-[#8FAFBD] leading-relaxed"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Collections Hierarchy */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8FAFBD] flex items-center gap-1.5 px-1">
          <Server className="w-3.5 h-3.5 text-[#FFAA00]" />
          Estrutura Exata das Coleções & Documentos
        </h3>

        {FIRESTORE_ARCHITECTURE.collections.map((col, idx) => (
          <div
            key={idx}
            className="p-4 bg-[#082F52] border border-[#14527A] rounded-2xl shadow-md space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#FFAA00]/20 text-[#FFAA00] border border-[#FFAA00]/30">
                  {col.path}
                </span>
                <h4 className="text-sm font-bold text-[#E8F4F8] mt-2">{col.description}</h4>
                <p className="text-xs text-[#8FAFBD] mt-1">{col.reasoning}</p>
              </div>

              <button
                id={`copy-json-btn-${idx}`}
                onClick={() =>
                  copyToClipboard(JSON.stringify(col.documentExample, null, 2), `col-${idx}`)
                }
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B3A61] hover:bg-[#10466D] border border-[#14527A] text-[11px] text-[#E8F4F8] font-medium transition-colors"
              >
                {copiedSection === `col-${idx}` ? (
                  <>
                    <Check className="w-3 h-3 text-[#00C98B]" />
                    <span className="text-[#00C98B]">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar JSON</span>
                  </>
                )}
              </button>
            </div>

            {/* Document JSON Preview */}
            <div className="bg-[#031F38] p-3 rounded-xl border border-[#14527A] overflow-x-auto">
              <pre className="text-[11px] font-mono text-[#FFAA00]/90 leading-relaxed">
                {JSON.stringify(col.documentExample, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Security Rules */}
      <div className="p-4 bg-[#082F52] border border-[#14527A] rounded-2xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#00C98B] text-sm font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Regras de Segurança Prontas (firestore.rules)</span>
          </div>

          <button
            id="copy-rules-btn"
            onClick={() =>
              copyToClipboard(FIRESTORE_ARCHITECTURE.securityRulesCode, 'rules')
            }
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B3A61] hover:bg-[#10466D] border border-[#14527A] text-[11px] text-[#E8F4F8] font-medium transition-colors"
          >
            {copiedSection === 'rules' ? (
              <>
                <Check className="w-3 h-3 text-[#00C98B]" />
                <span className="text-[#00C98B]">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copiar Regras</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-[#031F38] p-3 rounded-xl border border-[#14527A] overflow-x-auto">
          <pre className="text-[11px] font-mono text-[#00C98B]/90 leading-relaxed">
            {FIRESTORE_ARCHITECTURE.securityRulesCode}
          </pre>
        </div>
      </div>

      {/* Integration Code Snippet */}
      <div className="p-4 bg-[#082F52] border border-[#14527A] rounded-2xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#38C6D9] text-sm font-bold">
            <FileCode className="w-4 h-4" />
            <span>Funções de Integração no Frontend (Leitura & Gravação)</span>
          </div>

          <button
            id="copy-snippet-btn"
            onClick={() =>
              copyToClipboard(FIRESTORE_ARCHITECTURE.integrationSnippet, 'snippet')
            }
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B3A61] hover:bg-[#10466D] border border-[#14527A] text-[11px] text-[#E8F4F8] font-medium transition-colors"
          >
            {copiedSection === 'snippet' ? (
              <>
                <Check className="w-3 h-3 text-[#00C98B]" />
                <span className="text-[#00C98B]">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-[#031F38] p-3 rounded-xl border border-[#14527A] overflow-x-auto">
          <pre className="text-[11px] font-mono text-[#38C6D9]/90 leading-relaxed">
            {FIRESTORE_ARCHITECTURE.integrationSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
