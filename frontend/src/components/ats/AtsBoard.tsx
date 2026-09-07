import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useSensors,
  useSensor,
  PointerSensor,
  closestCorners,
} from '@dnd-kit/core';
import { Application, ApplicationStatus } from '../../types';
import { AtsColumn } from './AtsColumn';
import { AtsCandidateCard } from './AtsCandidateCard';
import { atsApi } from '../../api/atsApi';
import { useToast } from '../../context/ToastContext';

interface AtsBoardProps {
  initialPipeline: Record<ApplicationStatus, Application[]>;
  onScheduleInterview?: (app: Application) => void;
  onViewCandidate?: (app: Application) => void;
}

const COLUMNS: Array<{ id: ApplicationStatus; title: string; color: string }> = [
  { id: 'APPLIED', title: 'Applied', color: 'bg-slate-400' },
  { id: 'SHORTLISTED', title: 'Shortlisted', color: 'bg-sky-400' },
  { id: 'INTERVIEW', title: 'Interview', color: 'bg-violet-400' },
  { id: 'SELECTED', title: 'Selected / Hired', color: 'bg-emerald-400' },
  { id: 'REJECTED', title: 'Rejected', color: 'bg-red-400' },
];

export const AtsBoard: React.FC<AtsBoardProps> = ({
  initialPipeline,
  onScheduleInterview,
  onViewCandidate,
}) => {
  const [pipeline, setPipeline] = useState<Record<ApplicationStatus, Application[]>>(initialPipeline);
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);
  const { success, error: toastError } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement starts drag
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const appId = active.id as string;
    for (const stage of Object.keys(pipeline) as ApplicationStatus[]) {
      const found = pipeline[stage]?.find((a) => a._id === appId);
      if (found) {
        setActiveApplication(found);
        break;
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApplication(null);

    if (!over) return;

    const appId = active.id as string;
    let targetStage: ApplicationStatus | null = null;

    // If dropped over a column
    if (over.data.current?.type === 'Column') {
      targetStage = over.data.current.status as ApplicationStatus;
    } else if (over.data.current?.type === 'Application') {
      // Dropped over another card, find which column that card is in
      const targetAppId = over.id as string;
      for (const stage of Object.keys(pipeline) as ApplicationStatus[]) {
        if (pipeline[stage]?.some((a) => a._id === targetAppId)) {
          targetStage = stage;
          break;
        }
      }
    }

    if (!targetStage) return;

    // Find current source stage
    let currentStage: ApplicationStatus | null = null;
    let movedApp: Application | null = null;

    for (const stage of Object.keys(pipeline) as ApplicationStatus[]) {
      const idx = pipeline[stage]?.findIndex((a) => a._id === appId);
      if (idx !== -1 && idx !== undefined) {
        currentStage = stage;
        movedApp = pipeline[stage][idx];
        break;
      }
    }

    if (!currentStage || !movedApp || currentStage === targetStage) return;

    // Optimistic UI update
    const previousPipeline = { ...pipeline };
    setPipeline((prev) => {
      const sourceList = prev[currentStage!].filter((a) => a._id !== appId);
      const targetList = [{ ...movedApp!, status: targetStage! }, ...(prev[targetStage!] || [])];
      return {
        ...prev,
        [currentStage!]: sourceList,
        [targetStage!]: targetList,
      };
    });

    try {
      await atsApi.updateStage(appId, targetStage, `Moved to ${targetStage} stage via ATS pipeline board`);
      success('Stage Updated', `Candidate moved to ${targetStage}`);
    } catch (err: any) {
      // Rollback on error
      setPipeline(previousPipeline);
      toastError('Update Failed', 'Could not transition candidate stage. Rolling back.');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 select-none min-h-[500px]">
        {COLUMNS.map((col) => (
          <AtsColumn
            key={col.id}
            id={col.id}
            title={col.title}
            count={pipeline[col.id]?.length || 0}
            color={col.color}
            applications={pipeline[col.id] || []}
            onScheduleInterview={onScheduleInterview}
            onViewCandidate={onViewCandidate}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApplication ? (
          <div className="w-64 rotate-2 scale-105">
            <AtsCandidateCard application={activeApplication} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
