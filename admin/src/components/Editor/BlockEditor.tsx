import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect } from 'react';
import type { ContentBlockDto, ContentBlockType } from '@/types/block.types';
import BlockWrapper from './BlockWrapper';
import BlockToolbar from './BlockToolbar';
import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ImageBlock from './blocks/ImageBlock';
import CodeBlock from './blocks/CodeBlock';
import ListBlock from './blocks/ListBlock';
import DividerBlock from './blocks/DividerBlock';

interface BlockEditorProps {
  blocks: ContentBlockDto[];
  onChange: (blocks: ContentBlockDto[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const createBlockId = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  useEffect(() => {
    if (blocks.some((block) => !block.id)) {
      onChange(
        blocks.map((block) =>
          block.id ? block : { ...block, id: createBlockId() },
        ),
      );
    }
  }, [blocks, onChange]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(blocks, oldIndex, newIndex));
      }
    }
  };

  const addBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlockDto =
      type === 'code'
        ? { id: createBlockId(), type, codeType: 'javascript' }
        : { id: createBlockId(), type };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (index: number, block: ContentBlockDto) => {
    const updated = [...blocks];
    updated[index] = block;
    onChange(updated);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const renderBlock = (block: ContentBlockDto, index: number) => {
    const commonProps = {
      block,
      onChange: (updated: ContentBlockDto) => updateBlock(index, updated),
      onRemove: () => removeBlock(index),
    };

    switch (block.type) {
      case 'text':
        return <TextBlock {...commonProps} />;
      case 'heading':
        return <HeadingBlock {...commonProps} />;
      case 'image':
        return <ImageBlock {...commonProps} />;
      case 'code':
        return <CodeBlock {...commonProps} />;
      case 'list':
        return <ListBlock {...commonProps} />;
      case 'divider':
        return <DividerBlock onRemove={commonProps.onRemove} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {blocks.length === 0 ? (
        <div className="bg-violet-50 dark:bg-violet-900/20 border-2 border-dashed border-violet-200 dark:border-violet-800 rounded-2xl p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">No content blocks yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Click "Add Block" below to start creating your post content</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((block) => block.id as string)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block, index) => (
              <BlockWrapper key={block.id} id={block.id as string}>
                {renderBlock(block, index)}
              </BlockWrapper>
            ))}
          </SortableContext>
        </DndContext>
      )}

      <BlockToolbar onAddBlock={addBlock} />
    </div>
  );
}
