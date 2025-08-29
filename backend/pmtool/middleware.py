from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from core.models import Organization


class OrganizationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        header = getattr(settings, 'ORG_HEADER', 'X-Org-Slug')
        slug = request.headers.get(header) or request.META.get(f'HTTP_{header.upper().replace("-", "_")}')
        request.organization = None
        if slug:
            try:
                request.organization = Organization.objects.get(slug=slug)
            except Organization.DoesNotExist:
                request.organization = None