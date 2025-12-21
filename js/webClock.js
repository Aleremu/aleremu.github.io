/**
 * WebClockManager - Gestiona el reloj de la web y la comunicación con Unity
 * 
 * Funcionalidades:
 * - Reloj en tiempo real que se actualiza cada segundo
 * - Click en el reloj avanza una hora
 * - Comunicación bidireccional con Unity WebGL
 */
class WebClockManager {
    constructor() {
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.clockElement = null;
        this.unityReady = false;
        this.intervalId = null;
        
        this.init();
    }
    
    init() {
        // Inicializar con la hora actual del sistema
        const now = new Date();
        this.hours = now.getHours();
        this.minutes = now.getMinutes();
        this.seconds = now.getSeconds();
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.clockElement = document.getElementById('clock');
        
        if (this.clockElement) {
            // Hacer el reloj clickeable
            this.clockElement.style.cursor = 'pointer';
            this.clockElement.addEventListener('click', () => this.advanceHour());
            
            // Añadir tooltip
            this.clockElement.title = 'Click to advance one hour';
        }
        
        // Iniciar el reloj
        this.updateDisplay();
        this.startClock();
        
        // Escuchar cuando Unity esté listo
        window.addEventListener('unityClockReady', () => {
            this.unityReady = true;
            console.log('[WebClockManager] Unity clock bridge ready');
            this.syncTimeToUnity();
        });
        
        // Exponer globalmente para que Unity pueda acceder
        window.webClockManager = this;
    }
    
    startClock() {
        // Limpiar intervalo existente si lo hay
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
    }
    
    tick() {
        this.seconds++;
        
        if (this.seconds >= 60) {
            this.seconds = 0;
            this.minutes++;
            
            if (this.minutes >= 60) {
                this.minutes = 0;
                this.hours++;
                
                if (this.hours >= 24) {
                    this.hours = 0;
                }
                
                // Notificar a Unity del cambio de hora natural
                this.syncTimeToUnity();
            }
        }
        
        this.updateDisplay();
    }
    
    /**
     * Avanza el reloj una hora (llamado al hacer click)
     */
    advanceHour() {
        this.hours = (this.hours + 1) % 24;
        
        // Feedback visual
        if (this.clockElement) {
            this.clockElement.classList.add('clock-clicked');
            setTimeout(() => {
                this.clockElement.classList.remove('clock-clicked');
            }, 200);
        }
        
        this.updateDisplay();
        this.notifyHourAdvanced();
        
        console.log(`[WebClockManager] Hour advanced to ${this.hours}:${String(this.minutes).padStart(2, '0')}`);
    }
    
    /**
     * Actualiza el display del reloj en el DOM
     */
    updateDisplay() {
        if (this.clockElement) {
            const hoursStr = String(this.hours).padStart(2, '0');
            const minutesStr = String(this.minutes).padStart(2, '0');
            const secondsStr = String(this.seconds).padStart(2, '0');
            this.clockElement.textContent = `${hoursStr}:${minutesStr}:${secondsStr}`;
        }
    }
    
    /**
     * Envía la hora actual a Unity
     */
    syncTimeToUnity() {
        if (this.unityReady && window.unityClockBridge && window.unityClockBridge.sendTimeToUnity) {
            window.unityClockBridge.sendTimeToUnity(this.hours, this.minutes, this.seconds);
        }
    }
    
    /**
     * Notifica a Unity que el usuario avanzó la hora manualmente
     */
    notifyHourAdvanced() {
        if (this.unityReady && window.unityClockBridge && window.unityClockBridge.notifyHourAdvanced) {
            window.unityClockBridge.notifyHourAdvanced(this.hours, this.minutes, this.seconds);
        }
    }
    
    /**
     * Obtiene la hora actual (usado por Unity para solicitar la hora)
     */
    getCurrentTime() {
        return {
            hours: this.hours,
            minutes: this.minutes,
            seconds: this.seconds
        };
    }
    
    /**
     * Establece una hora específica (útil para testing)
     */
    setTime(hours, minutes = 0, seconds = 0) {
        this.hours = hours % 24;
        this.minutes = minutes % 60;
        this.seconds = seconds % 60;
        this.updateDisplay();
        this.syncTimeToUnity();
    }
}

// Inicializar el gestor del reloj
const webClock = new WebClockManager();
