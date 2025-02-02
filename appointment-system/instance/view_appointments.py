import sqlite3

conn = sqlite3.connect('appointments.db')
cursor = conn.cursor()

cursor.execute("SELECT * FROM appointment")

appointments = cursor.fetchall()

for appointment in appointments:
    print(appointment)

conn.close()
