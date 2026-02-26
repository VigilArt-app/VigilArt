"use client";
import React, { useState } from "react";

interface ReportData {
  id: string;
  userId: string;
  detectionDate: string;
  matchingPages: Array<{
    id: string;
    artworkId: string;
    category: string;
    url: string;
    websiteName: string;
    imageUrl: string;
    pageTitle: string;
    firstDetectedAt: string;
  }>;
}

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
};

const getUserIdFromToken = (token: string): string | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const decoded = JSON.parse(atob(parts[1]));
    return decoded.sub || decoded.sub || decoded.userId || decoded.id || null;
  } catch {
    return null;
  }
};

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);

  const handleCreate = async () => {
    setMessage(null);
    setReport(null);
    setLoading(true);

    const token = getAuthToken();
    if (!token) {
      setMessage("Token d'auth non trouvé. Connectez-vous.");
      setLoading(false);
      return;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      setMessage("Impossible de déterminer l'utilisateur à partir du token.");
      setLoading(false);
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
      const base = API_BASE.replace(/\/+$/, "");
      
      const createRes = await fetch(`${base}/reports/user/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({ message: createRes.statusText }));
        setMessage(`Échec création: ${err.message || createRes.statusText}`);
        setLoading(false);
        return;
      }

      const createdReport = await createRes.json();
      console.log("Created report response:", createdReport);
      
      const reportId = createdReport.data?.id || createdReport.id;
      
      if (!reportId) {
        setMessage(`Échec: ID du report non trouvé dans la réponse`);
        setLoading(false);
        return;
      }
      
      setMessage("Report créé avec succès. Chargement des détails...");

      const getRes = await fetch(`${base}/reports/${reportId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!getRes.ok) {
        const err = await getRes.json().catch(() => ({ message: getRes.statusText }));
        setMessage(`Échec récupération: ${err.message || getRes.statusText}`);
      } else {
        const response = await getRes.json();
        console.log("Fetched report data:", response);
        const reportData = response.data;
        setReport(reportData);
        const matchCount = reportData.matchingPages?.length || 0;
        setMessage(`Report chargé: ${matchCount} détections trouvées.`);
      }
    } catch (e: any) {
      setMessage(`Erreur: ${e?.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Créer un report pour tous mes artworks</h1>
      <p className="mb-4">Cliquez pour lancer la génération d'un report pour tous vos artworks.</p>
      <button
        onClick={handleCreate}
        disabled={loading}
        className="inline-flex items-center rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
      >
        {loading ? "Traitement..." : "Créer le report"}
      </button>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}

      {report && (
        <div className="mt-8 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Détails du Report</h2>
          <div className="mb-4 text-sm text-gray-600">
            <p><strong>ID:</strong> {report.id}</p>
            <p><strong>Date de détection:</strong> {new Date(report.detectionDate).toLocaleString('fr-FR')}</p>
            <p><strong>Nombre de détections:</strong> {report.matchingPages?.length || 0}</p>
          </div>

          {report.matchingPages && report.matchingPages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Détections</h3>
              <div className="space-y-4">
                {report.matchingPages.map((page, idx) => (
                  <div key={page.id} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      {page.imageUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={page.imageUrl}
                            alt="Detected"
                            className="w-24 h-24 object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <p className="text-sm"><strong>Catégorie:</strong> {page.category}</p>
                        <p className="text-sm"><strong>Site:</strong> {page.websiteName}</p>
                        <p className="text-sm"><strong>Titre:</strong> {page.pageTitle}</p>
                        <p className="text-sm"><strong>Première détection:</strong> {new Date(page.firstDetectedAt).toLocaleString('fr-FR')}</p>
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-800 text-sm mt-2 inline-block"
                        >
                          Voir la page →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
