import { StateGraph, START, END } from '@langchain/langgraph';
import { StateAnnotation } from './state';
import { fetchPrNode } from './nodes/fetch-pr';
import { parseAndChunkNode } from './nodes/parse-and-chunk';
import { retrieveGuidelinesNode } from './nodes/retrieve-guidelines';
import { agentQualityNode } from './nodes/agent-quality';
import { agentSecurityNode } from './nodes/agent-security';
import { agentPerformanceNode } from './nodes/agent-performance';
import { synthesizerNode } from './nodes/synthesizer';
import { postCommentNode } from './nodes/post-comment';

export const reviewGraph = new StateGraph(StateAnnotation)
  .addNode('fetch-pr', fetchPrNode)
  .addNode('parse-and-chunk', parseAndChunkNode)
  .addNode('retrieve-guidelines', retrieveGuidelinesNode)
  .addNode('agent-quality', agentQualityNode)
  .addNode('agent-security', agentSecurityNode)
  .addNode('agent-performance', agentPerformanceNode)
  .addNode('synthesizer', synthesizerNode)
  .addNode('post-comment', postCommentNode)
  .addEdge(START, 'fetch-pr')
  .addEdge('fetch-pr', 'parse-and-chunk')
  .addEdge('parse-and-chunk', 'retrieve-guidelines')
  .addEdge('retrieve-guidelines', 'agent-quality')
  .addEdge('retrieve-guidelines', 'agent-security')
  .addEdge('retrieve-guidelines', 'agent-performance')
  .addEdge('agent-quality', 'synthesizer')
  .addEdge('agent-security', 'synthesizer')
  .addEdge('agent-performance', 'synthesizer')
  .addEdge('synthesizer', 'post-comment')
  .addEdge('post-comment', END)
  .compile();
