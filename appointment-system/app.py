from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///appointments.db'
db = SQLAlchemy(app)

# Define the Appointment model
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    date = db.Column(db.String(10), nullable=False)
    time_slot = db.Column(db.String(5), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('date', 'time_slot', name='_date_time_slot_uc'),  # Enforce unique slot per date
    )

# Generate available time slots
def generate_slots():
    slots = []
    time_intervals = [("10:00", "13:00"), ("14:00", "17:00")]
    
    for start, end in time_intervals:
        start_time = datetime.strptime(start, "%H:%M")
        end_time = datetime.strptime(end, "%H:%M")
        while start_time < end_time:
            slots.append(start_time.strftime("%H:%M"))
            start_time += timedelta(minutes=30)
    
    return slots

# Route to serve the index.html file
@app.route('/')
def index():
    return render_template('index.html')  # This renders index.html from the templates folder

@app.route('/available_slots', methods=['GET'])
def available_slots():
    date = request.args.get('date')
    print(f"Date received: {date}")  # For debugging
    booked_slots = {a.time_slot for a in Appointment.query.filter_by(date=date).all()}
    print(f"Booked slots: {booked_slots}")  # For debugging
    available = [slot for slot in generate_slots() if slot not in booked_slots]
    print(f"Available slots: {available}")  # For debugging
    return jsonify(available)


# Route to book an appointment
@app.route('/book', methods=['POST'])
def book():
    data = request.json
    if not data or not all(k in data for k in ("name", "phone", "date", "time_slot")):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Check if slot is already booked
    if Appointment.query.filter_by(date=data['date'], time_slot=data['time_slot']).first():
        return jsonify({"error": "Slot already booked"}), 400
    
    new_appointment = Appointment(
        name=data['name'], 
        phone=data['phone'], 
        date=data['date'], 
        time_slot=data['time_slot']
    )
    db.session.add(new_appointment)
    db.session.commit()
    return jsonify({"message": "Booking confirmed"})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Creates the database and tables
    app.run(host='0.0.0.0', port=5000, debug=True)
