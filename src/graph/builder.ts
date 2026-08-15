import { StateGraph, START, END } from '@langchain/langgraph';
import { StateAnnotation } from './state';
import { fetchPrNode } from './nodes/fetch-pr';
import { parseAndChunkNode } from './nodes/parse-and-chunk';
import { agentQualityNode } from './nodes/agent-quality';
import { agentSecurityNode } from './nodes/agent-security';
import { agentPerformanceNode } from './nodes/agent-performance';
import { synthesizerNode } from './nodes/synthesizer';
import { postCommentNode } from './nodes/post-comment';

export const reviewGraph = new StateGraph(StateAnnotation)
  .addNode('fetch-pr', fetchPrNode)
  .addNode('parse-and-chunk', parseAndChunkNode)
  .addNode('agent-quality', agentQualityNode)
  .addNode('agent-security', agentSecurityNode)
  .addNode('agent-performance', agentPerformanceNode)
  .addNode('synthesizer', synthesizerNode)
  .addNode('post-comment', postCommentNode)
  .addEdge(START, 'fetch-pr')
  .addEdge('fetch-pr', 'parse-and-chunk')
  .addEdge('parse-and-chunk', 'agent-quality')
  .addEdge('parse-and-chunk', 'agent-security')
  .addEdge('parse-and-chunk', 'agent-performance')
  .addEdge('agent-quality', 'synthesizer')
  .addEdge('agent-security', 'synthesizer')
  .addEdge('agent-performance', 'synthesizer')
  .addEdge('synthesizer', 'post-comment')
  .addEdge('post-comment', END)
  .compile();
