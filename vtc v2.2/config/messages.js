/**
 * Mensajes personalizados para las notificaciones VTV
 */

const MESSAGES = {
    URGENTE_HOY: (vehicleData) => `🚨 ¡URGENTE! 🚨

Hola, somos de la Verificación Técnica Vehicular Alto Verde.

Queremos informarte que tu vehículo *${vehicleData.marca} ${vehicleData.modelo}* con patente *${vehicleData.patente}* la VTV *VENCE HOY*.

📅 Fecha de vencimiento: ${vehicleData.fechaVencimiento}

⚠️Por disposición de la nueva ley vigente, se aplicará un recargo trimestral del 35% a quienes circulen con la VTV vencida más de 10 días y para vehiculos de transporte de personas el vencimiento para a ser cada 1 año, si te ha llegado esta notificacion y tu vehiculo es de transporte de personas te pedimos que mires el vencimiento y si es necesario que lo renueves.⚠️

👨‍🔧Te recomendamos renovarla pronto para evitar inconvenientes.

¡Saludos del equipo de Alto Verde! 👨‍🔧`,

    URGENTE_PROXIMO: (vehicleData, dias) => `🚨 ¡URGENTE! 🚨

Hola, somos de la Verificación Técnica Vehicular Alto Verde.

Queremos informarte que tu vehículo *${vehicleData.marca} ${vehicleData.modelo}* con patente *${vehicleData.patente}* la VTV vence en *${dias} días*.

📅 Fecha de vencimiento: ${vehicleData.fechaVencimiento}

⚠️Por disposición de la nueva ley vigente, se aplicará un recargo trimestral del 35% a quienes circulen con la VTV vencida más de 10 días y para vehiculos de transporte de personas el vencimiento para a ser cada 1 año, si te ha llegado esta notificacion y tu vehiculo es de transporte de personas te pedimos que mires el vencimiento y si es necesario que lo renueves.⚠️

👨‍🔧Te recomendamos renovarla pronto para evitar inconvenientes.

¡Saludos del equipo de Alto Verde! 👨‍🔧`,

    AVISO_NORMAL: (vehicleData, dias) => `🔔 ¡AVISO! 🔔

Hola, somos de la Verificación Técnica Vehicular Alto Verde.

Queremos informarte que tu vehículo *${vehicleData.marca} ${vehicleData.modelo}* con patente *${vehicleData.patente}* la VTV vence en *${dias} días*.

📅 Fecha de vencimiento: ${vehicleData.fechaVencimiento}

⚠️Por disposición de la nueva ley vigente, se aplicará un recargo trimestral del 35% a quienes circulen con la VTV vencida más de 10 días y para vehiculos de transporte de personas el vencimiento para a ser cada 1 año, si te ha llegado esta notificacion y tu vehiculo es de transporte de personas te pedimos que mires el vencimiento y si es necesario que lo renueves.⚠️

👨‍🔧Te recomendamos renovarla pronto para evitar inconvenientes.

¡Saludos del equipo de Alto Verde! 👨‍🔧`,

    VENCIDA: (vehicleData, diasVencido) => `🚨 ¡ATENCIÓN! 🚨

Hola, somos de la Verificación Técnica Vehicular Alto Verde.

Queremos informarte que tu vehículo *${vehicleData.marca} ${vehicleData.modelo}* con patente *${vehicleData.patente}* tiene la VTV *VENCIDA* desde hace *${diasVencido} días*.

📅 Fecha de vencimiento: ${vehicleData.fechaVencimiento}

⚠️Por disposición de la nueva ley vigente, se aplicará un recargo trimestral del 35% a quienes circulen con la VTV vencida más de 10 días y para vehiculos de transporte de personas el vencimiento para a ser cada 1 año, si te ha llegado esta notificacion y tu vehiculo es de transporte de personas te pedimos que mires el vencimiento y si es necesario que lo renueves.⚠️

¡Saludos del equipo de Alto Verde! 👨‍🔧`
};

module.exports = {
    MESSAGES
};