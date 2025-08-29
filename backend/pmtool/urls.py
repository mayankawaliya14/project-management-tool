from django.contrib import admin
from django.urls import path
from pmtool.graphql_view import ContextGraphQLView


urlpatterns = [
path('admin/', admin.site.urls),
path('graphql/', ContextGraphQLView.as_view(graphiql=True)),
]