import json
import os
import psycopg2
import psycopg2.extras

ALLOWED_STATUSES = {'new', 'in_progress', 'done', 'delivered', 'cancelled'}

def handler(event: dict, context) -> dict:
    """Управление заявками прачечной: получение списка и смена статуса заказа"""
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

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        password = body.get('password') or ''
        if password == os.environ.get('ADMIN_PANEL_PASSWORD'):
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True})}
        return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный пароль'})}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            try:
                page = max(1, int(params.get('page', 1)))
            except (TypeError, ValueError):
                page = 1
            try:
                limit = int(params.get('limit', 10))
            except (TypeError, ValueError):
                limit = 10
            if limit not in (5, 10, 25, 50, 100):
                limit = 10
            offset = (page - 1) * limit

            search = (params.get('search') or '').strip()
            status_param = (params.get('status') or '').strip()
            statuses = [s for s in status_param.split(',') if s in ALLOWED_STATUSES] if status_param else []

            conditions = []
            if search:
                search_escaped = search.replace("'", "''").replace('%', '\\%').replace('_', '\\_')
                conditions.append(f"(name ILIKE '%{search_escaped}%' OR phone ILIKE '%{search_escaped}%')")
            if statuses:
                statuses_list = ", ".join(f"'{s}'" for s in statuses)
                conditions.append(f"status IN ({statuses_list})")

            where = f"WHERE {' AND '.join(conditions)}" if conditions else ''

            cur = conn.cursor()
            cur.execute(f"SELECT COUNT(*) FROM orders {where}")
            total = cur.fetchone()[0]
            cur.close()

            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute(
                f"SELECT id, name, phone, comment, ip_address, user_agent, os_info, "
                f"created_at, status FROM orders {where} ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
            )
            rows = cur.fetchall()
            cur.close()
            orders = []
            for r in rows:
                orders.append({
                    'id': r['id'],
                    'name': r['name'],
                    'phone': r['phone'],
                    'comment': r['comment'],
                    'ip_address': r['ip_address'],
                    'user_agent': r['user_agent'],
                    'os_info': r['os_info'],
                    'created_at': r['created_at'].isoformat(),
                    'status': r['status']
                })
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'orders': orders, 'total': total, 'page': page, 'limit': limit})
            }

        if method == 'PUT':
            body = json.loads(event.get('body') or '{}')
            order_id = body.get('id')
            new_status = body.get('status')

            if not isinstance(order_id, int):
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не указан id заявки'})}

            if new_status not in ALLOWED_STATUSES:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Недопустимый статус'})}

            cur = conn.cursor()
            cur.execute(f"UPDATE orders SET status = '{new_status}' WHERE id = {order_id} RETURNING id")
            row = cur.fetchone()
            conn.commit()
            cur.close()

            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Заявка не найдена'})}

            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True})}

        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
    finally:
        conn.close()