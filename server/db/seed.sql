USE dailywell_tracker;

INSERT INTO users (name, email, password_hash)
VALUES (
  'Demo User',
  'demo@dailywell.app',
  '$2a$10$4o2HOiYKSi7I8ftw5tk6f.nOJCWMW/a6.P5IqPAXJf2C5xRAnQfES'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password_hash = VALUES(password_hash);

SET @demo_user_id = (SELECT id FROM users WHERE email = 'demo@dailywell.app');

DELETE FROM medicine_logs WHERE user_id = @demo_user_id;
DELETE FROM medicines WHERE user_id = @demo_user_id;
DELETE FROM water_logs WHERE user_id = @demo_user_id;
DELETE FROM food_logs WHERE user_id = @demo_user_id;
DELETE FROM fasting_sessions WHERE user_id = @demo_user_id;
DELETE FROM goals WHERE user_id = @demo_user_id;

INSERT INTO water_logs (user_id, amount_ml, note, logged_at)
VALUES
  (@demo_user_id, 250, 'Morning water', TIMESTAMP(CURDATE(), '08:10:00')),
  (@demo_user_id, 500, 'Post workout', TIMESTAMP(CURDATE(), '10:45:00')),
  (@demo_user_id, 250, 'Lunch refill', TIMESTAMP(CURDATE(), '13:20:00')),
  (@demo_user_id, 500, 'Afternoon bottle', TIMESTAMP(CURDATE(), '16:05:00'));

INSERT INTO food_logs (user_id, meal_type, food_name, calories, note, logged_at)
VALUES
  (@demo_user_id, 'breakfast', 'Greek yogurt bowl', 320, 'Berries and granola', TIMESTAMP(CURDATE(), '08:30:00')),
  (@demo_user_id, 'lunch', 'Paneer rice bowl', 540, 'Balanced lunch', TIMESTAMP(CURDATE(), '13:05:00')),
  (@demo_user_id, 'snack', 'Apple and almonds', 180, 'Light snack', TIMESTAMP(CURDATE(), '17:15:00'));

INSERT INTO medicines (user_id, name, dosage, schedule_time, notes)
VALUES
  (@demo_user_id, 'Vitamin D3', '1000 IU', '09:00:00', 'After breakfast'),
  (@demo_user_id, 'Omega 3', '1 capsule', '21:00:00', 'After dinner'),
  (@demo_user_id, 'Magnesium', '200 mg', '22:00:00', 'Before sleep');

INSERT INTO medicine_logs (user_id, medicine_id, status, note, logged_at)
SELECT @demo_user_id, id, 'taken', 'Logged from demo seed', TIMESTAMP(CURDATE(), schedule_time)
FROM medicines
WHERE user_id = @demo_user_id;

INSERT INTO fasting_sessions (user_id, start_time, end_time, status, note)
VALUES
  (@demo_user_id, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '20:00:00'), TIMESTAMP(CURDATE(), '10:00:00'), 'completed', '14 hour fast'),
  (@demo_user_id, TIMESTAMP(CURDATE(), '20:00:00'), NULL, 'active', 'Evening fast');

INSERT INTO goals (user_id, title, category, target_value, unit, period, status)
VALUES
  (@demo_user_id, 'Drink Water', 'water', 2500, 'ml', 'daily', 'active'),
  (@demo_user_id, 'Daily Calories', 'food', 2000, 'kcal', 'daily', 'active'),
  (@demo_user_id, 'Avoid Fast Food', 'food', 3, 'times or less', 'weekly', 'active'),
  (@demo_user_id, 'Take Vitamins', 'medicine', 3, 'dose', 'daily', 'active'),
  (@demo_user_id, '14 Hour Fast', 'fasting', 14, 'hours', 'weekly', 'active');
