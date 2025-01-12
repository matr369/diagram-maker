import { Store } from 'redux';
import { v4 as uuid } from 'uuid';

import ConfigService from 'diagramMaker/service/ConfigService';
import { getCenteredPosition } from 'diagramMaker/service/positionUtils';
import { NormalizedTarget } from 'diagramMaker/service/ui/UITargetNormalizer';
import {
  DiagramMakerData,
  Position,
  Rectangle,
  Size,
} from 'diagramMaker/state/types';

import { DeselectAction, WorkspaceActionsType } from 'diagramMaker/state';
import {
  CreateNodeAction,
  DeselectNodeAction,
  DragEndNodeAction,
  DragEndPotentialNodeAction,
  DragNodeAction,
  DragPotentialNodeAction,
  DragStartNodeAction,
  DragStartPotentialNodeAction,
  NodeActionsType,
  SelectNodeAction,
} from './nodeActions';

export const MARGIN_PX = 10;

function createSelectNodeAction(id: string): SelectNodeAction {
  return {
    type: NodeActionsType.NODE_SELECT,
    payload: { id },
  };
}
function createDeselectNodeAction(id: string): DeselectNodeAction {
  return {
    type: NodeActionsType.NODE_DESELECT,
    payload: { id },
  };
}

function createDragStartNodeAction(id: string): DragStartNodeAction {
  return {
    type: NodeActionsType.NODE_DRAG_START,
    payload: { id },
  };
}

function createDragEndNodeAction(
  id: string,
  position: Position,
  size: Size,
): DragEndNodeAction {
  return {
    type: NodeActionsType.NODE_DRAG_END,
    payload: { id, position, size },
  };
}

function createDragNodeAction(
  id: string,
  position: Position,
  workspaceRectangle: Rectangle,
  size: Size,
): DragNodeAction {
  return {
    type: NodeActionsType.NODE_DRAG,
    payload: {
      id, position, workspaceRectangle, size,
    },
  };
}

function createPotentialNodeDragStartAction<NodeType>(
  typeId: string,
  position: Position,
  size: Size,
  consumerData?: NodeType,
): DragStartPotentialNodeAction<NodeType> {
  return {
    type: NodeActionsType.POTENTIAL_NODE_DRAG_START,
    payload: {
      typeId,
      position,
      size,
      ...(consumerData ? { consumerData } : {}),
    },
  };
}

function createPotentialNodeDragAction(position: Position, workspaceRectangle: Rectangle): DragPotentialNodeAction {
  return {
    type: NodeActionsType.POTENTIAL_NODE_DRAG,
    payload: { position, workspaceRectangle },
  };
}

function createPotentialNodeDragEndAction(): DragEndPotentialNodeAction {
  return {
    type: NodeActionsType.POTENTIAL_NODE_DRAG_END,
  };
}

function createDeselectAction(): DeselectAction {
  return {
    type: WorkspaceActionsType.WORKSPACE_DESELECT,
  };
}

function createNewNodeAction<NodeType>(
  id: string,
  typeId: string,
  position: Position,
  size: Size,
  consumerData?: NodeType,
): CreateNodeAction<NodeType> {
  return {
    type: NodeActionsType.NODE_CREATE,
    payload: {
      id, typeId, position, size, consumerData,
    },
  };
}

function getSizeFromDataAttrs(target: NormalizedTarget): Size | undefined {
  const width = target.originalTarget.getAttribute('data-width');
  const height = target.originalTarget.getAttribute('data-height');
  if (width && height) {
    const parsedWidth = parseInt(width, 10);
    const parsedHeight = parseInt(height, 10);
    if (!Number.isNaN(parsedWidth) && !Number.isNaN(parsedHeight)) {
      return { width: parsedWidth, height: parsedHeight };
    }
  }
  return undefined;
}

export function handleNodeClick<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
  withCtrl: boolean,
) {
  if (!id) {
    return;
  }

  if (!withCtrl) {
    store.dispatch(createDeselectAction());
  }

  const nodeSelected = store.getState().nodes[id].diagramMakerData.selected;

  if (withCtrl && nodeSelected) {
    store.dispatch(createDeselectNodeAction(id));
  } else {
    store.dispatch(createSelectNodeAction(id));
  }
}

export function handleNodeDragStart<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
) {
  if (id) {
    const action = createDragStartNodeAction(id);
    store.dispatch(action);
  }
}

export function handleNodeDrag<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
  position: Position,
) {
  if (id) {
    const { canvasSize } = store.getState().workspace;
    const workspaceRectangle = {
      position: { x: 0, y: 0 },
      size: canvasSize,
    };
    const node = store.getState().nodes[id];
    if (node) {
      const { size } = node.diagramMakerData;
      const action = createDragNodeAction(id, position, workspaceRectangle, size);
      store.dispatch(action);
    }
  }
}

export function handleNodeDragEnd<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
  position: Position,
  size: Size,
) {
  if (id) {
    const action = createDragEndNodeAction(id, position, size);
    store.dispatch(action);
  }
}

export function handlePotentialNodeDragStart<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  config: ConfigService<NodeType, EdgeType>,
  target: NormalizedTarget,
  position: Position,
) {
  const typeId = target.id;
  if (typeId) {
    const size = getSizeFromDataAttrs(target) || config.getSizeForNodeType(typeId);
    const consumerData = JSON.parse(target.originalTarget.getAttribute('data-consumer-data') || 'null');
    if (size) {
      const centeredPosition = getCenteredPosition(position, size);
      const action = createPotentialNodeDragStartAction(typeId, centeredPosition, size, consumerData);
      store.dispatch(action);
    }
  }
}

export function handlePotentialNodeDrag<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  position: Position,
) {
  const { canvasSize } = store.getState().workspace;
  const workspaceRectangle = {
    position: { x: 0, y: 0 },
    size: canvasSize,
  };
  const { potentialNode } = store.getState();

  if (potentialNode) {
    const { size } = potentialNode;
    const action = createPotentialNodeDragAction(getCenteredPosition(position, size), workspaceRectangle);
    store.dispatch(action);
  }
}

export function handlePotentialNodeDragEnd<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  typeId: string | undefined,
) {
  if (typeId) {
    const action = createPotentialNodeDragEndAction();
    store.dispatch(action);
  }
}

export function handleNodeCreate<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  typeId: string | undefined,
) {
  if (typeId) {
    const id = `${uuid()}`;
    const state = store.getState();
    const { potentialNode } = state;
    if (potentialNode) {
      const { position, size, consumerData } = potentialNode;
      const action = createNewNodeAction(id, typeId, position, size, consumerData);
      store.dispatch(action);
    }
  }
}
