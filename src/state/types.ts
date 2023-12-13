import { UndoHistoryState } from 'redux-undo-redo';

import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { DiagramMakerAction } from 'diagramMaker/state/actions';
import { ConnectorType } from 'diagramMaker/components';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export enum EditorModeType {
  /**
   * Allows the workspace to be dragged to pan the visible area across the window.
   */
  DRAG = 'Drag',
  /**
   * Prevents UI interactions other than panning and zooming the workspace.
   */
  READ_ONLY = 'ReadOnly',
  /**
   * Allows selection of multiple nodes with a rectangular marquee.
   */
  SELECT = 'Select',
  /**
   *
   */
  COPY = 'Copy',
}

export const EditorMode = {
  ...EditorModeType,
};

export interface Rectangle {
  position: Position;
  size: Size;
}

export type ShowConnectorsType = 'Input' | 'Output' | 'Both' | 'None';

export const ShowConnectors: { [type: string]: ShowConnectorsType } = {
  BOTH: 'Both',
  INPUT_ONLY: 'Input',
  NONE: 'None',
  OUTPUT_ONLY: 'Output',
};

/** Interface for storing the state of the diagram maker workspace */
export interface DiagramMakerWorkspace {
  /**
   * Denotes the pixel values that the workspace has been translated by on x & y axis
   */
  readonly position: Position;
  /**
   * Denotes the scale of the workspace, where 1 denotes natural scale.
   * Smaller than 1 denotes that the workspace has been zoomed out.
   * Greater than 1 denotes that the workspace has been zoomed in.
   */
  readonly scale: number;
  /**
   * Denotes the size of the workspace that the customer can move nodes around in.
   * Every object within the workspace, i.e. nodes, edges, potential nodes stays within these bounds.
   */
  readonly canvasSize: Size;
  /**
   * Denotes the size of the container diagram maker is rendered in.
   * To update due to window resizing, or panels outside diagram maker shifting content,
   * call the `updateContainer` API.
   */
  readonly viewContainerSize: Size;
}

export enum PositionAnchorType {
  /** Top Left edge of the container that diagram maker renders in */
  TOP_LEFT = 'TopLeft',
  /** Top Right edge of the container that diagram maker renders in */
  TOP_RIGHT = 'TopRight',
  /** Bottom Left edge of the container that diagram maker renders in */
  BOTTOM_LEFT = 'BottomLeft',
  /** Bottom Right edge of the container that diagram maker renders in */
  BOTTOM_RIGHT = 'BottomRight',
}

export const PositionAnchor = {
  ...PositionAnchorType,
};

/**
 * Interface for storing the state of a given diagram maker node.
 * @template NodeType - The type of data stored per node by the consumer.
 */
export interface DiagramMakerNode<NodeType> {
  /**
   * Unique identifier for the node.
   * Autogenerated for nodes newly created.
   * Supplied for nodes already present when diagram maker initializes.
   * In the case it is supplied, please ensure that this is unique.
   */
  readonly id: string;
  /**
   * Type of the node. Optional.
   * References to the id present on the potential node when it was dragged in.
   * Also useful to specify override connector placements, hiding specific connectors
   * or providing the shape for boundary connector placements.
   */
  readonly typeId?: string;
  /**
   * Contains node data managed by diagram maker.
   */
  readonly diagramMakerData: {
    /**
     * Current position of the node w.r.t the workspace
     */
    readonly position: Position;
    /**
     * Current size of the node
     */
    readonly size: Size;
    /**
     * Denotes whether the node is currently selected.
     */
    readonly selected?: boolean;
    /**
     * Denotes whether the node is currently being dragged.
     */
    readonly dragging?: boolean;
    /**
     * Initial position for the latest Drag Start action
     */
    readonly startDragPosition?: Position;
    /**
     * Additional class names
     */
    readonly classNames?: string[];
  };
  /** Contains data managed by the consumer */
  readonly consumerData?: NodeType;
}

/**
 * Interface for storing state of several diagram maker nodes.
 * @template NodeType - The type of data stored per node by the consumer.
 */
export interface DiagramMakerNodes<NodeType> {
  readonly [id: string]: DiagramMakerNode<NodeType>;
}

/** Interface for storing state of diagram maker potential node i.e. a new node being dragged onto the workspace */
export interface DiagramMakerPotentialNode<NodeType> {
  /** Type of the node. Mandatory for providing context during node creation */
  readonly typeId: string;
  /** Current position of the potential node w.r.t the workspace */
  readonly position: Position;
  /** Size of the potential node as detected via tha data attrs on the drag target or via the type config */
  readonly size: Size;
  /** Contains data managed by the consumer */
  readonly consumerData?: NodeType;
}

/**
 * Interface for storing state of a given diagram maker edge.
 * @template EdgeType - The type of data stored per edge by the consumer
 */
export interface DiagramMakerEdge<EdgeType> {
  /**
   * Unique identifier for the edge.
   * Autogenerated for edges newly created.
   * Supplied for edges already present when diagram maker initializes.
   * In the case it is supplied, please ensure that this is unique.
   */
  readonly id: string;
  /**
   * References the id for the node where this edge originates.
   * Leads to inconsistencies if this refers to a node that doesnt exist.
   */
  readonly src: string;
  /**
   * References the src connector type (optional)
   */
  readonly connectorSrcType?: string;
  /**
   * References the id for the node where this edge ends.
   * Leads to inconsistencies if this refers to a node that doesnt exist.
   */
  readonly dest: string;
  /**
   * References the dest connector type (optional)
   */
  readonly connectorDestType?: string;
  /** Contains edge data managed by diagram maker */
  readonly diagramMakerData: {
    /** Denotes whether the edge is selected */
    readonly selected?: boolean;
    /** Additional class names */
    readonly classNames?: string[];
  };
  /** Contains data managed by the consumer */
  readonly consumerData?: EdgeType;
}

/**
 * Interface for storing state of several diagram maker edges.
 * @template EdgeType - The type of data stored per edge by the consumer
 */
export interface DiagramMakerEdges<EdgeType> {
  readonly [id: string]: DiagramMakerEdge<EdgeType>;
}

/** Interface for storing state of diagram maker potential edge i.e. a new edge being drawn on the workspace */
export interface DiagramMakerPotentialEdge {
  /**
   * References the id for the node where this edge originates.
   * Leads to inconsistencies if this refers to a node that doesnt exist.
   */
  readonly src: string;
  /**
   * Current position where the potential edge is pointing.
   * Usually refers to the cursor position relative to the workspace scale & position.
   */
  readonly position: Position;
  /**
   * References the src connector type (optional)
   */
  readonly connectorSrcType?: string;
}

/** Interface for storing state of a diagram maker panel */
export interface DiagramMakerPanel {
  /**
   * Unique identifier for the panel.
   * Provided by the consumer.
   * Used for referencing the render callback.
   */
  readonly id: string;
  /**
   * Current position of the panel in the view container.
   * Please note that panels remain outside the workspace
   * so are not affected by its scale & panning.
   */
  readonly position: Position;
  /**
   * Current size for the panel.
   * Used for providing a container to render the panel content in.
   */
  readonly size: Size;
  /**
   * Position Anchor. Optional. Used for docking panels.
   * When not specified, panels are assumed to be relative to Top Left corner of view container.
   * When specified, position is assumed to be relative to the anchor.
   */
  readonly positionAnchor?: PositionAnchorType;

  /**
   * Denoted whether the panel is in undocking mode.
   * Panel is in undocking mode when it was previously docked,
   * is currently being dragged and is within the docking bounds.
   */
  readonly undocking?: boolean;
}

/** Interface for storing state for several diagram maker panels */
export interface DiagramMakerPanels {
  readonly [id: string]: DiagramMakerPanel;
}

/** Interface for storing state for a diagram maker plugin */
export interface DiagramMakerPlugin {
  readonly data: any;
}

/** Interface for storing state for several diagram maker plugins */
export interface DiagramMakerPlugins {
  readonly [id: string]: DiagramMakerPlugin;
}

/** Interface for storing state for diagram maker context menu */
export interface DiagramMakerContextMenu {
  /**
   * Current position of the context menu in the view container.
   * Please note context menus are not part of the workspace
   * so not affected by its scale & panning.
   */
  readonly position: Position;
  /**
   * Type of the object that the context menu is being displayed for.
   * For example, node, edge, panel, workspace, etc.
   */
  readonly targetType: DiagramMakerComponentsType;
  /**
   * Unique identifier to identify the specific node or edge or panel.
   * Absent for the workspace.
   */
  readonly targetId?: string;
}

/** Interface for storing state for diagram maker selection marquee */
export interface DiagramMakerSelectionMarquee {
  /**
   * Position where the user clicked to start the selection.
   * This remains one of the 4 corners of the selections marquee
   */
  readonly anchor: Position;
  /**
   * Current position of the cursor.
   */
  readonly position: Position;
}

/** Interface for storing state for diagram maker editor */
export interface DiagramMakerEditor {
  /**
   * Current context menu state if one needs to be rendered currently.
   */
  readonly contextMenu?: DiagramMakerContextMenu;
  /**
   * Current mode of the editor.
   */
  readonly mode: EditorModeType;
  /**
   * Current selection marquee state if one needs to be rendered currently.
   */
  readonly selectionMarquee?: DiagramMakerSelectionMarquee;
}

export interface DiagramMakerData<NodeType, EdgeType, PluginsType = DiagramMakerPlugins> {
  /** Current state for all nodes */
  readonly nodes: DiagramMakerNodes<NodeType>;
  /** Current state for all edges */
  readonly edges: DiagramMakerEdges<EdgeType>;
  /** Current state for all panels */
  readonly panels: DiagramMakerPanels;
  /** Current state for all plugins */
  readonly plugins?: PluginsType;
  /** Current state for diagram maker workspace */
  readonly workspace: DiagramMakerWorkspace;
  /** Current state for diagram maker potential node if one needs to be rendered currently */
  readonly potentialEdge?: DiagramMakerPotentialEdge | null;
  /** Current state for diagram maker potential edge if one needs to be rendered currently */
  readonly potentialNode?: DiagramMakerPotentialNode<NodeType> | null;
  /** Current state for diagram maker editor */
  readonly editor: DiagramMakerEditor;
  /** History of undoable actions */
  readonly undoHistory?: UndoHistoryState<DiagramMakerAction<NodeType, EdgeType>>;
}

export interface DiagramMakerConnector {
  id: string;
  type: ConnectorType;
  position: Position;
}
