import { 
  RRWebEvent, 
  ProcessedSession,
  SemanticIncrementalSnapshot,
  SemanticIncrementalData,
  INCREMENTAL_SOURCE_NAMES,
  IncrementalSourceName,
  MOUSE_INTERACTION_NAMES,
  POINTER_TYPE_NAMES,
  MEDIA_INTERACTION_NAMES,
  CANVAS_CONTEXT_NAMES,
  NodeType,
  SemanticMutation,
  SemanticMouseMove,
  SemanticMouseInteraction,
  SemanticScroll,
  SemanticViewportResize,
  SemanticInput,
  SemanticTouchMove,
  SemanticMediaInteraction,
  SemanticStyleSheetRule,
  SemanticCanvasMutation,
  SemanticFont,
  SemanticLog,
  SemanticDrag,
  SemanticStyleDeclaration,
  SemanticSelection,
  SemanticAdoptedStyleSheet
} from '../types';
import { BaseProcessor } from './BaseProcessor';

interface IncrementalSnapshotEvent extends RRWebEvent {
  type: 3;
  data: {
    source: number;
    [key: string]: any;
  };
}

export class IncrementalSnapshotProcessor extends BaseProcessor {
  // Reference to the procesed session for incrementing domUpdates
  private session: ProcessedSession | null = null;

  process(event: RRWebEvent, session: ProcessedSession): void {
    this.session = session;
    if (!this.isIncrementalEvent(event)) return;
    this.updateEventCounts(event, session);
    const semanticSnapshot = this.transformToSemantic(event);
    if (session.dom?.incrementalSnapshots) {
      session.dom.incrementalSnapshots.push(semanticSnapshot);
    }
    this.session = null; // Clear reference after processing
  }

  private isIncrementalEvent(event: RRWebEvent): event is IncrementalSnapshotEvent {
    return event.type === 3 && 
           typeof event.data?.source === 'number' && 
           event.data.source >= 0 && 
           event.data.source <= 15;
  }

  private transformToSemantic(event: IncrementalSnapshotEvent): SemanticIncrementalSnapshot {
    const sourceKey = event.data.source.toString() as keyof typeof INCREMENTAL_SOURCE_NAMES;
    const sourceName = INCREMENTAL_SOURCE_NAMES[sourceKey] as IncrementalSourceName;
    
    return {
      timestamp: this.formatTimestamp(event.timestamp),
      source: sourceName,
      data: this.transformData(event.data)
    };
  }

  private transformData(data: any): SemanticIncrementalData {
    switch (data.source) {
      case 0: 
        if (this.session) {
          this.session.technical.performance.domUpdates += 1;
        }
        return this.transformMutationData(data);
      case 1: return this.transformMouseMoveData(data);
      case 2: return this.transformMouseInteractionData(data);
      case 3: return this.transformScrollData(data);
      case 4: return this.transformViewportResizeData(data);
      case 5: return this.transformInputData(data);
      case 6: return this.transformTouchMoveData(data);
      case 7: return this.transformMediaInteractionData(data);
      case 8: return this.transformStyleSheetRuleData(data);
      case 9: return this.transformCanvasMutationData(data);
      case 10: return this.transformFontData(data);
      case 11: return this.transformLogData(data);
      case 12: return this.transformDragData(data);
      case 13: return this.transformStyleDeclarationData(data);
      case 14: return this.transformSelectionData(data);
      case 15: return this.transformAdoptedStyleSheetData(data);
      default:
        throw new Error(`Unknown incremental source: ${data.source}`);
    }
  }

  private transformMutationData(data: any): SemanticMutation {
    // Debug log to see the actual data structure
    // console.log('Mutation Data:', JSON.stringify(data, null, 2));

    return {
      type: 'mutation',
      adds: data.adds?.map(this.transformNodeOperation),
      removes: data.removes?.map(this.transformNodeOperation),
      attributes: data.attributes?.map((attr: any) => ({
        id: attr.id,
        changes: Object.entries(attr.attributes || {}).map(([key, value]) => ({
          attribute: key,
          value: value as string | null
        }))
      })),
      texts: data.texts?.map((text: any) => {
        // Debug log for text mutation structure
        // console.log('Text Mutation:', JSON.stringify(text, null, 2));
        
        return {
          nodeDescription: text.id ? `node-${text.id}` : 'unknown',
          oldText: text.oldValue,
          newText: text.value
        };
      })
    };
  }

  private transformNodeOperation = (operation: any): any => {
    // Debug log for node operation
    // console.log('Node Operation:', JSON.stringify(operation, null, 2));

    if (!operation.node) {
      return {
        parentId: operation.parentId,
        id: operation.id
      };
    }

    // Helper to convert numeric type to NodeType
    const getNodeType = (numericType: number): NodeType => {
      switch (numericType) {
        case 0:
          return NodeType.Document;
        case 1:
          return NodeType.DocumentType;
        case 2:
          return NodeType.Element;
        case 3:
          return NodeType.Text;
        case 4:
          return NodeType.CDATA;
        case 5:
          return NodeType.Comment;
        default:
          console.warn(`Unknown node type: ${numericType}`);
          return NodeType.Element; // Default fallback
      }
    };

    return {
      parentId: operation.parentId,
      nextId: operation.nextId,
      node: {
        ...operation.node,
        type: operation.node.type !== undefined ? getNodeType(operation.node.type) : NodeType.Element,
        id: operation.node.id,
        tagName: operation.node.tagName,
        attributes: operation.node.attributes,
        childNodes: operation.node.childNodes?.map(this.transformNodeOperation)
      }
    };
  };

  private transformMouseMoveData(data: any): SemanticMouseMove {
    return {
      type: 'mouseMove',
      positions: data.positions.map((pos: any) => ({
        x: pos.x,
        y: pos.y,
        timeOffset: pos.timeOffset
      }))
    };
  }

  private transformMouseInteractionData(data: any): SemanticMouseInteraction {
    const typeKey = data.type.toString() as keyof typeof MOUSE_INTERACTION_NAMES;
    const pointerTypeKey = (data.pointerType || 0).toString() as keyof typeof POINTER_TYPE_NAMES;

    return {
      type: 'mouseInteraction',
      action: MOUSE_INTERACTION_NAMES[typeKey],
      pointerType: POINTER_TYPE_NAMES[pointerTypeKey],
      position: {
        x: data.x,
        y: data.y
      }
    };
  }

  private transformScrollData(data: any): SemanticScroll {
    return {
      type: 'scroll',
      position: {
        x: data.x,
        y: data.y
      }
    };
  }

  private transformViewportResizeData(data: any): SemanticViewportResize {
    return {
      type: 'viewportResize',
      size: {
        width: data.width,
        height: data.height
      }
    };
  }

  private transformInputData(data: any): SemanticInput {
    return {
      type: 'input',
      text: data.text,
      isChecked: data.isChecked,
      userTriggered: data.userTriggered || false
    };
  }

  private transformTouchMoveData(data: any): SemanticTouchMove {
    return {
      type: 'touchMove',
      positions: data.positions.map((pos: any) => ({
        x: pos.x,
        y: pos.y,
        timeOffset: pos.timeOffset
      }))
    };
  }

  private transformMediaInteractionData(data: any): SemanticMediaInteraction {
    const typeKey = data.type.toString() as keyof typeof MEDIA_INTERACTION_NAMES;
    
    return {
      type: 'mediaInteraction',
      action: MEDIA_INTERACTION_NAMES[typeKey],
      currentTime: data.currentTime,
      volume: data.volume,
      muted: data.muted,
      playbackRate: data.playbackRate
    };
  }

  private transformStyleSheetRuleData(data: any): SemanticStyleSheetRule {
    return {
      type: 'styleSheetRule',
      adds: data.adds?.map((add: any) => ({
        rule: add.rule,
        index: add.index
      })),
      removes: data.removes?.map((remove: any) => ({
        index: remove.index
      })),
      replace: data.replace,
      replaceSync: data.replaceSync
    };
  }

  private transformCanvasMutationData(data: any): SemanticCanvasMutation {
    const contextTypeKey = (data.type || 0).toString() as keyof typeof CANVAS_CONTEXT_NAMES;

    return {
      type: 'canvasMutation',
      contextType: CANVAS_CONTEXT_NAMES[contextTypeKey],
      commands: Array.isArray(data.commands) ? data.commands : [{
        property: data.property,
        args: data.args,
        setter: data.setter
      }]
    };
  }

  private transformFontData(data: any): SemanticFont {
    return {
      type: 'font',
      family: data.family,
      source: data.source,
      descriptors: data.descriptors,
      buffer: data.buffer
    };
  }

  private transformLogData(data: any): SemanticLog {
    return {
      type: 'log',
      level: data.level,
      args: data.args
    };
  }

  private transformDragData(data: any): SemanticDrag {
    return {
      type: 'drag',
      positions: data.positions.map((pos: any) => ({
        x: pos.x,
        y: pos.y,
        timeOffset: pos.timeOffset
      }))
    };
  }

  private transformStyleDeclarationData(data: any): SemanticStyleDeclaration {
    return {
      type: 'styleDeclaration',
      index: data.index,
      set: data.set && {
        property: data.set.property,
        value: data.set.value,
        priority: data.set.priority
      },
      remove: data.remove && {
        property: data.remove.property
      }
    };
  }

  private transformSelectionData(data: any): SemanticSelection {
    return {
      type: 'selection',
      ranges: data.ranges.map((range: any) => ({
        start: range.start,
        startOffset: range.startOffset,
        end: range.end,
        endOffset: range.endOffset
      }))
    };
  }

  private transformAdoptedStyleSheetData(data: any): SemanticAdoptedStyleSheet {
    return {
      type: 'adoptedStyleSheet',
      id: data.id,
      styles: data.styles?.map((style: any) => ({
        styleId: style.styleId,
        rules: style.rules.map((rule: any) => ({
          rule: rule.rule,
          index: rule.index
        }))
      })),
      styleIds: data.styleIds
    };
  }
}