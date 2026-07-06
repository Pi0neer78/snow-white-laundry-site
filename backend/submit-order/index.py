import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Принимает заявку с сайта прачечной Белоснежка и сохраняет её в базу данных"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if method != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body') or '{}')
    name = (body.get('name') or '').strip()
    phone = (body.get('phone') or '').strip()
    comment = (body.get('comment') or '').strip()

    if not name or not phone:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите имя и телефон'})}

    if len(name) > 255 or len(phone) > 50:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Слишком длинное значение'})}

    request_context = event.get('requestContext', {})
    ip_address = request_context.get('identity', {}).get('sourceIp', '')
    event_headers = event.get('headers', {}) or {}
    user_agent = event_headers.get('User-Agent') or event_headers.get('user-agent') or ''

    os_info = 'Unknown'
    ua_lower = user_agent.lower()
    if 'windows' in ua_lower:
        os_info = 'Windows'
    elif 'mac os' in ua_lower or 'macintosh' in ua_lower:
        os_info = 'macOS'
    elif 'android' in ua_lower:
        os_info = 'Android'
    elif 'iphone' in ua_lower or 'ipad' in ua_lower or 'ios' in ua_lower:
        os_info = 'iOS'
    elif 'linux' in ua_lower:
        os_info = 'Linux'

    name_escaped = name.replace("'", "''")
    phone_escaped = phone.replace("'", "''")
    comment_escaped = comment.replace("'", "''")
    ip_escaped = ip_address.replace("'", "''")
    ua_escaped = user_agent.replace("'", "''")
    os_escaped = os_info.replace("'", "''")

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    try:
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO orders (name, phone, comment, ip_address, user_agent, os_info, status) "
            f"VALUES ('{name_escaped}', '{phone_escaped}', '{comment_escaped}', '{ip_escaped}', '{ua_escaped}', '{os_escaped}', 'new') "
            f"RETURNING id, created_at"
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
    finally:
        conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'id': row[0], 'created_at': row[1].isoformat()})
    }