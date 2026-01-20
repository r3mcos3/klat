# Test Deadline Notification Systeem

## Volledige Test Procedure

### 1. Maak een test note aan met deadline over 24 uur

1. Log in op je Klat app
2. Maak een nieuwe note aan
3. Stel de deadline in op **morgen om deze tijd** (24 uur vanaf nu)
4. Sla de note op

### 2. Controleer Settings

1. Ga naar `/settings` in je app
2. Controleer dat "Email notifications" is **enabled** (toggle staat aan)

### 3. Test de n8n workflow handmatig

1. Open de workflow in n8n
2. Klik op **"Execute Workflow"** rechtsboven (de play button)
3. Bekijk de output van elke node:
   - **Query Upcoming Deadlines**: Moet je test note vinden
   - **Has Notes?**: Moet TRUE zijn
   - **Get User Email & Prefs**: Moet je email en emailNotifications=true tonen
   - **Notifications Enabled?**: Moet TRUE zijn
   - **Send Email**: Moet succesvol een email versturen
   - **Log Notification**: Moet een entry aanmaken in notification_logs

### 4. Controleer je email

1. Check je inbox (kan 1-2 minuten duren)
2. Je zou een email moeten ontvangen met:
   - Subject: "Reminder: [eerste regel van je note] deadline tomorrow"
   - HTML body met deadline datum/tijd
   - Nederlandse datum formatting

### 5. Controleer duplicate preventie

1. Voer de workflow nog een keer handmatig uit
2. Je zou **geen tweede email** moeten ontvangen
3. Check de `notification_logs` tabel - er zou een entry moeten zijn voor je note

### 6. Test notification settings

1. Ga naar `/settings`
2. Zet "Email notifications" **uit** (toggle)
3. Voer de workflow handmatig uit
4. Je zou **geen email** moeten ontvangen (workflow stopt bij "Notifications Enabled?" check)

## Troubleshooting

### Geen notes gevonden
- Check dat je deadline exact 24 uur ± 1 uur is
- Workflow zoekt naar deadlines tussen 23-25 uur in de toekomst
- Check dat `completedAt` NULL is (note niet voltooid)

### Geen email ontvangen
- Check Gmail/Resend credentials in n8n
- Check workflow execution logs in n8n
- Voor Resend: controleer dat je "from" email verified is
- Check spam folder

### Dubbele emails
- Check de notification_logs tabel
- Zou een unique constraint error moeten geven in n8n

### Database query errors
- Check Supabase credentials
- Test de connection in n8n credential settings
- Check dat de tabellen bestaan in Supabase

## SQL Queries voor Debugging

### Check user preferences
```sql
SELECT * FROM user_preferences WHERE "userId" = 'your-user-id';
```

### Check notification logs
```sql
SELECT * FROM notification_logs ORDER BY "sentAt" DESC;
```

### Check notes met deadlines
```sql
SELECT id, "userId", content, deadline, "completedAt"
FROM notes
WHERE deadline IS NOT NULL
  AND "completedAt" IS NULL
ORDER BY deadline;
```

### Vind notes met deadline over ~24 uur
```sql
SELECT id, "userId", content, deadline
FROM notes
WHERE deadline >= NOW() + INTERVAL '23 hours'
  AND deadline <= NOW() + INTERVAL '25 hours'
  AND "completedAt" IS NULL;
```
