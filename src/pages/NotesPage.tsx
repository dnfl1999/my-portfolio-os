import { useState } from "react";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { NoteForm } from "../components/forms/NoteForm";
import { InvestmentNote } from "../types";
import { formatDate } from "../utils/formatters";

interface NotesPageProps {
  store: ReturnType<typeof import("../hooks/usePortfolioStore").usePortfolioStore>;
}

export function NotesPage({ store }: NotesPageProps) {
  const [editing, setEditing] = useState<InvestmentNote | null>(null);

  return (
    <div className="page-grid">
      <Card
        title={editing ? "투자노트 수정" : "투자노트 작성"}
        description="왜 샀는지, 언제 더 사고 언제 팔지까지 한 화면에서 정리합니다."
      >
        <NoteForm
          holdings={store.data.holdings}
          initialValue={editing}
          onSubmit={(value) => {
            store.saveNote(value, editing?.id);
            setEditing(null);
          }}
          onCancel={editing ? () => setEditing(null) : undefined}
        />
      </Card>

      <div className="notes-grid">
        {store.data.notes.length === 0 ? (
          <Card>
            <EmptyState
              title="투자노트가 없습니다."
              description="매수 이유와 리스크를 기록해 두면 나중에 복기하기가 훨씬 쉬워집니다."
            />
          </Card>
        ) : (
          store.data.notes.map((note) => {
            const holding = store.data.holdings.find((item) => item.id === note.holdingId);

            return (
              <Card
                key={note.id}
                title={note.title}
                description={`${holding?.name ?? "미연결"} · ${formatDate(note.updatedAt)}`}
                action={
                  <div className="table-actions">
                    <button className="button ghost small" onClick={() => setEditing(note)} type="button">
                      수정
                    </button>
                    <button className="button danger small" onClick={() => store.deleteNote(note.id)} type="button">
                      삭제
                    </button>
                  </div>
                }
              >
                <div className="note-content">
                  <div>
                    <strong>왜 샀는지</strong>
                    <p>{note.reasonToBuy}</p>
                  </div>
                  <div>
                    <strong>추가매수 조건</strong>
                    <p>{note.addCondition || "-"}</p>
                  </div>
                  <div>
                    <strong>매도 조건</strong>
                    <p>{note.sellCondition || "-"}</p>
                  </div>
                  <div>
                    <strong>리스크 요인</strong>
                    <p>{note.riskFactors || "-"}</p>
                  </div>
                  <div>
                    <strong>복기 메모</strong>
                    <p>{note.reviewMemo || "-"}</p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
