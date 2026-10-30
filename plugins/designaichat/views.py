import json
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from sysreptor.utils.api import StreamingHttpResponseAsync, ViewSetAsync
from sysreptor.utils.configuration import configuration
from sysreptor.ai.agents.base import get_default_model_id, init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage

async def to_sse(generator):
    async for chunk in generator:
        yield f'data: {json.dumps({"type": "text", "content": chunk.content})}\n\n'.encode()

class DesignAiChatViewSet(viewsets.ViewSet, ViewSetAsync):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    async def chat(self, request):
        if not configuration.AI_AGENT_ENABLED:
            return Response({"error": "AI disabled"}, status=400)
            
        data = request.data
        prompt = data.get("prompt", "")
        
        try:
            model_id = get_default_model_id()
            model = init_chat_model(model_id)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        messages = [
            SystemMessage(content="You are an expert web designer assisting with SysReptor report templates (HTML, CSS, Vue.js). Provide code snippets and design advice."),
            HumanMessage(content=prompt)
        ]

        async def stream():
            async for chunk in model.astream(messages):
                yield chunk
                
        return StreamingHttpResponseAsync(
            streaming_content=to_sse(stream()),
            content_type='text/event-stream'
        )
