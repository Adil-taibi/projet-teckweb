import express, { type Request, type Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

// إعدادات CORS للسماح بالطلبات من أي مصدر
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const MONGO_URI = "mongodb+srv://adiltaibi:adiltaibi3131@cluster0.y11lkt8.mongodb.net/?appName=Cluster0";

// دالة الاتصال بقاعدة البيانات
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        throw err;
    }
};

// --- تعريف الـ Schemas ---

// موديل المواعيد مع ميزة تحويل _id إلى id تلقائياً للفرونتاند
const appointmentSchema = new mongoose.Schema({
    name: String,
    phone: String,
    appointment_date: String,
    appointment_time: String,
    status: { type: String, default: 'Pending' }
});

// تحويل المعرف ليتوافق مع الفرونتاند (id و _id)
appointmentSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        (ret as any).id = ret._id; // أضفنا (as any) هنا لحل مشكلة TypeScript
        return ret;
    }
});

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

const Availability = mongoose.models.Availability || mongoose.model('Availability', new mongoose.Schema({
    date: { type: String, unique: true },
    slots: [String]
}));

// --- المسارات (Routes) ---

app.get('/', (req, res) => res.send("API is active and running..."));

// 1. جلب المواعيد المتاحة ليوم معين
app.get('/availability', async (req: Request, res: Response) => {
    try {
        await connectDB();
        const { date } = req.query;
        const row = await Availability.findOne({ date: date as string });
        res.json(row ? [row] : []);
    } catch (err: any) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

// 2. تحديث أو إضافة أوقات العمل (للأدمن)
app.post('/availability', async (req: Request, res: Response) => {
    try {
        await connectDB();
        const { date, slots } = req.body;
        const result = await Availability.findOneAndUpdate(
            { date },
            { date, slots },
            { upsert: true, new: true }
        );
        res.json({ message: "Saved successfully", data: result });
    } catch (err: any) {
        res.status(500).json({ error: "Save error", details: err.message });
    }
});

// 3. جلب جميع المواعيد (للمرضى وللأدمن)
app.get('/clients', async (req, res) => {
    try {
        await connectDB();
        const rows = await Appointment.find().sort({ appointment_date: 1 });
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: "Fetch error" });
    }
});

// 4. تسجيل موعد جديد
app.post('/register', async (req: Request, res: Response) => {
    try {
        await connectDB();
        const { name, phone, date, time } = req.body;
        const newAppointment = new Appointment({
            name,
            phone,
            appointment_date: date,
            appointment_time: time
        });
        await newAppointment.save();
        res.json({ message: "Registered Successfully" });
    } catch (err: any) {
        res.status(500).json({ error: "Registration error", details: err.message });
    }
});

// 5. تحديث حالة الموعد أو الوقت (المسار المصلح)
app.patch('/appointments/:id/status', async (req: Request, res: Response) => {
    try {
        await connectDB();
        const { id } = req.params;
        const { status, appointment_time } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (appointment_time) updateData.appointment_time = appointment_time;

        const updated = await Appointment.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        res.json({ success: true, data: updated });
    } catch (err: any) {
        res.status(500).json({ error: "Update failed", details: err.message });
    }
});

// 6. حذف موعد
app.delete('/appointments/:id', async (req: Request, res: Response) => {
    try {
        await connectDB();
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const deleted = await Appointment.findByIdAndDelete(id);
        
        if (!deleted) {
            return res.status(404).json({ error: "Not found" });
        }

        res.json({ success: true, message: "Deleted successfully" });
    } catch (err: any) {
        res.status(500).json({ error: "Delete error" });
    }
});

export default app;