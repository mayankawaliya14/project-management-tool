from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


@method_decorator(csrf_exempt, name='dispatch')
class ContextGraphQLView(GraphQLView):
    def get_context(self, request):
        context = request
        context.organization = getattr(request, 'organization', None)
        return context