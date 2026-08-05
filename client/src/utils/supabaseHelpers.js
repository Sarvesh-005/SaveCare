// client/src/utils/supabaseHelpers.js

// Map DB snake_case row to App camelCase object
export function mapFromSupabase(entity, row) {
  if (!row) return null;
  switch (entity) {
    case 'patients':
      return {
        _id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        dateOfBirth: row.date_of_birth,
        gender: row.gender,
        bloodType: row.blood_type || 'Unknown',
        phone: row.phone,
        email: row.email || '',
        address: row.address || '',
        allergies: row.allergies || [],
        emergencyContact: row.emergency_contact || { name:'', phone:'', relation:'' },
        isActive: row.is_active ?? true,
        createdAt: row.created_at
      };

    case 'doctors':
      return {
        _id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        specialization: row.specialization,
        department: row.department,
        phone: row.phone,
        email: row.email,
        licenseNumber: row.license_number,
        available: row.available ?? true,
        schedule: row.schedule || {},
        createdAt: row.created_at
      };

    case 'appointments':
      return {
        _id: row.id,
        patientId: typeof row.patients === 'object' && row.patients ? mapFromSupabase('patients', row.patients) : row.patient_id,
        doctorId: typeof row.doctors === 'object' && row.doctors ? mapFromSupabase('doctors', row.doctors) : row.doctor_id,
        date: row.date,
        time: row.time,
        type: row.type || 'consultation',
        status: row.status || 'scheduled',
        reason: row.reason || '',
        notes: row.notes || '',
        createdAt: row.created_at
      };

    case 'medical_records':
      return {
        _id: row.id,
        patientId: typeof row.patients === 'object' && row.patients ? mapFromSupabase('patients', row.patients) : row.patient_id,
        doctorId: typeof row.doctors === 'object' && row.doctors ? mapFromSupabase('doctors', row.doctors) : row.doctor_id,
        appointmentId: row.appointment_id,
        diagnosis: row.diagnosis,
        symptoms: row.symptoms || [],
        prescription: row.prescription || [],
        labResults: row.lab_results || [],
        vitalSigns: row.vital_signs || {},
        notes: row.notes || '',
        createdAt: row.created_at
      };

    case 'invoices':
      return {
        _id: row.id,
        invoiceNumber: row.invoice_number,
        patientId: typeof row.patients === 'object' && row.patients ? mapFromSupabase('patients', row.patients) : row.patient_id,
        appointmentId: row.appointment_id,
        items: row.items || [],
        subtotal: Number(row.subtotal || 0),
        tax: Number(row.tax || 0),
        total: Number(row.total || 0),
        status: row.status || 'pending',
        paymentMethod: row.payment_method,
        issuedAt: row.issued_at,
        paidAt: row.paid_at,
        createdAt: row.created_at
      };

    default:
      return row;
  }
}

// Map App camelCase object to DB snake_case payload
export function mapToSupabase(entity, data) {
  switch (entity) {
    case 'patients':
      return {
        first_name: data.firstName,
        last_name: data.lastName,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        blood_type: data.bloodType || 'Unknown',
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        allergies: data.allergies || [],
        emergency_contact: data.emergencyContact || {},
        is_active: data.isActive ?? true
      };

    case 'doctors':
      return {
        first_name: data.firstName,
        last_name: data.lastName,
        specialization: data.specialization,
        department: data.department,
        phone: data.phone,
        email: data.email,
        license_number: data.licenseNumber,
        available: data.available ?? true,
        schedule: data.schedule || {}
      };

    case 'appointments':
      return {
        patient_id: typeof data.patientId === 'object' ? data.patientId._id || data.patientId.id : data.patientId,
        doctor_id: typeof data.doctorId === 'object' ? data.doctorId._id || data.doctorId.id : data.doctorId,
        date: data.date,
        time: data.time,
        type: data.type || 'consultation',
        status: data.status || 'scheduled',
        reason: data.reason || null,
        notes: data.notes || null
      };

    case 'medical_records':
      return {
        patient_id: typeof data.patientId === 'object' ? data.patientId._id || data.patientId.id : data.patientId,
        doctor_id: typeof data.doctorId === 'object' ? data.doctorId._id || data.doctorId.id : data.doctorId,
        appointment_id: data.appointmentId || null,
        diagnosis: data.diagnosis,
        symptoms: data.symptoms || [],
        prescription: data.prescription || [],
        lab_results: data.labResults || [],
        vital_signs: data.vitalSigns || {},
        notes: data.notes || null
      };

    case 'invoices':
      return {
        invoice_number: data.invoiceNumber || `INV-${String(Math.floor(1000 + Math.random() * 9000))}`,
        patient_id: typeof data.patientId === 'object' ? data.patientId._id || data.patientId.id : data.patientId,
        appointment_id: data.appointmentId || null,
        items: data.items || [],
        subtotal: data.subtotal,
        tax: data.tax || 0,
        total: data.total,
        status: data.status || 'pending',
        payment_method: data.paymentMethod || null,
        issued_at: data.issuedAt || new Date().toISOString(),
        paid_at: data.paidAt || null
      };

    default:
      return data;
  }
}
