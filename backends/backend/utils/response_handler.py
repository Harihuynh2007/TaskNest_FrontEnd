from rest_framework.response import Response

def api_response(success = True, message = 'Success', data = None, status = 200):
    return Response({
        'success': success,
        'message': message,
        'data': data
    },status = status)
