import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useEmotionalBrain } from '../store/useEmotionalBrain';
import Badge from './Badge';
import { 
    LucideShieldAlert, LucideBrainCircuit, LucideWind, LucideWaves, 
    LucideZap, LucideHeart, LucideArrowRight, LucideCheckCircle, 
    LucideRotateCw, LucideActivity, LucideSmile, LucideEye, 
    LucideFingerprint, LucideDna, LucideSparkles, LucideCompass
} from 'lucide-react';

/**
 * 🌌 THE NEURAL WORLDS CONFIGURATION
 * Each world is a complete emotional dimension with unique physics and behavior.
 */
const WORLDS = {
    anxiety: { 
        id: 'anxiety', 
        name: 'Deep Peace', 
        type: 'Fluid Dimension',
        personality: 'The Serene Guide',
        atmosphere: 'Deep Underwater',
        physics: 'Slow, floating particles',
        story: 'Quiet the noise in your mind.', 
        color: '#00adef',
        secondary: '#091426',
        video: 'https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-beautiful-nebula-in-space-31782-large.mp4',
        icon: <LucideWaves />,
        stages: [
            { id: 'scan', title: 'Neural Scan', text: 'Locate the static in your nervous system.', btn: 'Identified', type: 'scan' },
            { id: 'breathe', title: 'Fluid Breath', text: 'Sync your lungs with the ocean current.', btn: 'Flowing', type: 'breathe' },
            { id: 'ground', title: 'Blue Lock', text: 'Anchor your eyes on the deep teal light.', btn: 'Anchored', type: 'lock' },
            { id: 'release', title: 'Dissolve', text: 'Let your thoughts become water.', btn: 'Dissolved', type: 'release' }
        ]
    },
    yoga: { 
        id: 'yoga', 
        name: 'Somatic Earth', 
        type: 'Grounded Reality',
        personality: 'The Ancient Mother',
        atmosphere: 'Forest Roots',
        physics: 'Dense, earthy pulses',
        story: 'Move your body to feel light.', 
        color: '#8b5cf6',
        secondary: '#2e1065',
        video: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-on-a-beach-at-sunset-2565-large.mp4',
        icon: <LucideDna />,
        stages: [
            { id: 'tension', title: 'Tension Map', text: 'Press your feet down. Feel the earth push back.', btn: 'Connected', type: 'tension' },
            { id: 'stretch', title: 'Muscle Release', text: 'Release the heavy weight in your shoulders.', btn: 'Released', type: 'stretch' },
            { id: 'pulse', title: 'Earth Pulse', text: 'Sync your heartbeat with the forest floor.', btn: 'Synced', type: 'pulse' },
            { id: 'integrate', title: 'Rooted', text: 'You are part of the earth now. Feel the power.', btn: 'I Am Rooted', type: 'release' }
        ]
    },
    focus: { 
        id: 'focus', 
        name: 'Clarity Chamber', 
        type: 'Geometric Focus',
        personality: 'The Architect',
        atmosphere: 'Crystal Void',
        physics: 'Sharp, linear beams',
        story: 'Clear the fog and see better.', 
        color: '#fbbf24',
        secondary: '#451a03',
        video: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-keyboard-and-a-cup-of-coffee-34446-large.mp4',
        icon: <LucideBrainCircuit />,
        stages: [
            { id: 'fog', title: 'Fog Removal', text: 'The brain fog is temporary. Watch it dissolve.', btn: 'Fog Gone', type: 'fog' },
            { id: 'lock', title: 'Object Lock', text: 'Lock your mind onto a single point of light.', btn: 'Locked On', type: 'lock' },
            { id: 'neural', title: 'Pulse Sync', text: 'Fire your neurons in a clean, straight line.', btn: 'Fired Up', type: 'pulse' },
            { id: 'execute', title: 'Clear Vision', text: 'The path is now clear. Ready to act?', btn: 'Ready', type: 'release' }
        ]
    },
    panic: { 
        id: 'panic', 
        name: 'Neural Shelter', 
        type: 'High-Security Calm',
        personality: 'The Guardian',
        atmosphere: 'Adaptive Sanctuary',
        physics: 'Protective shield layers',
        story: 'Find safety right now.', 
        color: '#ef4444',
        secondary: '#450a0a',
        video: 'https://assets.mixkit.co/videos/preview/mixkit-underwater-view-of-bubbles-rising-to-the-surface-338-large.mp4',
        icon: <LucideShieldAlert />,
        stages: [
            { id: 'safety', title: 'Wall Lock', text: 'Touch the nearest wall. It is solid. It is safe.', btn: 'I Am Safe', type: 'safety' },
            { id: 'heart', title: 'Rate Stabilize', text: 'The storm is outside. You are inside the shield.', btn: 'Stable', type: 'stabilize' },
            { id: 'breathe', title: 'Shield Breath', text: 'Breathe the thick, clean air of the shelter.', btn: 'Safe Breath', type: 'breathe' },
            { id: 'release', title: 'Shelter Lock', text: 'Stay here as long as you need. You are home.', btn: 'Complete', type: 'release' }
        ]
    }
};

const RecoveryJourney = () => {
    const navigate = useNavigate();
    const brain = useEmotionalBrain();
    const [selectedWorld, setSelectedWorld] = useState(null);
    const [currentStage, setCurrentStage] = useState(0);
    const [reactivity, setReactivity] = useState(0); // 0 to 1, based on user speed/behavior
    const tapCount = useRef(0);
    const lastTap = useRef(Date.now());

    // 🤖 REACTIVITY ENGINE: Detects speed, hesitation, etc.
    const handleInteraction = () => {
        const now = Date.now();
        const diff = now - lastTap.current;
        lastTap.current = now;
        
        if (diff < 300) { // Fast tapping
            setReactivity(prev => Math.min(prev + 0.1, 1));
        } else {
            setReactivity(prev => Math.max(prev - 0.05, 0));
        }
    };

    const startWorld = (world) => {
        setSelectedWorld(world);
        brain.setJourney(world.id);
        brain.emitEvent('NEURAL_WORLD_ENTERED', { world: world.id });
        setCurrentStage(0);
        setReactivity(0);
    };

    const nextStage = () => {
        if (currentStage < selectedWorld.stages.length - 1) {
            setCurrentStage(prev => prev + 1);
        }
    };

    return (
        <div className="min-h-screen font-['Inter'] overflow-hidden">
            <AnimatePresence mode="wait">
                {!selectedWorld ? (
                    <WorldSelectionScreen onSelect={startWorld} />
                ) : (
                    <NeuralSession 
                        world={selectedWorld} 
                        currentStage={currentStage} 
                        onNext={nextStage} 
                        reactivity={reactivity}
                        onInteraction={handleInteraction}
                        onComplete={() => {
                            brain.emitEvent('NEURAL_WORLD_COMPLETED', { world: selectedWorld.id });
                            setSelectedWorld(null);
                            navigate('/exercises');
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * 🌍 SELECTION SCREEN
 */
const WorldSelectionScreen = ({ onSelect }) => (
    <motion.div 
        key="selection"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-7xl mx-auto py-12 px-6 space-y-12 sm:space-y-16"
    >
        <header className="space-y-6">
            <Badge variant="solid" color="teal" size="sm" className="tracking-[6px] sm:tracking-[10px] uppercase !bg-white shadow-sm !text-[#00adef] border border-[#00adef]/10">Neural Recovery Center</Badge>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9] text-[#091426]">
                Neural <br />
                <span className="text-[#00adef] italic drop-shadow-sm">Realities.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 font-medium max-w-2xl leading-relaxed">
                Choose an emotional dimension to shift your nervous system state.
            </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {Object.values(WORLDS).map((w) => (
                <motion.div 
                    key={w.id} 
                    whileHover={{ y: -10, scale: 1.02 }}
                    onClick={() => onSelect(w)}
                    className="group relative bg-[#091426] rounded-[32px] sm:rounded-[48px] p-6 sm:p-8 h-[400px] sm:h-[450px] flex flex-col justify-between cursor-pointer shadow-2xl overflow-hidden transition-all duration-700"
                >
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-60 transition-opacity duration-1000 grayscale group-hover:grayscale-0">
                        <video autoPlay loop muted src={w.video} className="w-full h-full object-cover"></video>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#091426] via-[#091426]/40 to-transparent group-hover:from-[#091426]/90 transition-all duration-700"></div>

                    <div className="relative z-10 space-y-4 sm:space-y-6">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[16px] sm:rounded-[24px] flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12 group-hover:scale-110 duration-500`} style={{ backgroundColor: w.color }}>
                            {w.icon}
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[#00adef] uppercase tracking-[4px]">{w.type}</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-[#00adef] transition-colors">{w.name}</h3>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-4 sm:space-y-6">
                        <p className="text-xs sm:text-sm text-white/40 font-medium italic">"{w.story}"</p>
                        <button className={`w-full py-4 sm:py-5 rounded-[20px] sm:rounded-[24px] font-black uppercase tracking-[6px] sm:tracking-[8px] text-[10px] flex items-center justify-center gap-3 transition-all duration-500 bg-white text-[#091426] group-hover:bg-[#00adef] group-hover:text-white`}>
                            Enter World
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    </motion.div>
);

/**
 * 🧘 NEURAL SESSION - THE CORE ENGINE
 */
const NeuralSession = ({ world, currentStage, onNext, reactivity, onInteraction, onComplete }) => {
    const stage = world.stages[currentStage];
    const isFinal = currentStage === world.stages.length - 1;

    return (
        <motion.div 
            key="session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onInteraction}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-start p-6 sm:p-10 overflow-y-auto"
            style={{ backgroundColor: world.secondary }}
        >
            {/* 🎬 CINEMATIC BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                 <video autoPlay loop muted src={world.video} className="w-full h-full object-cover opacity-20 blur-2xl scale-125 transition-all duration-[3000ms]" style={{ filter: `blur(${40 + reactivity * 40}px) grayscale(${reactivity})` }}></video>
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#091426]/80"></div>
                 
                 {/* Neural Particles */}
                 <ParticleSystem color={world.color} count={20 + reactivity * 50} />
            </div>

            {/* 🤖 AI PERSONALITY INDICATOR */}
            <div className="relative md:absolute md:top-12 flex flex-col items-center gap-4 z-20 mt-4 md:mt-0 mb-8 md:mb-0">
                <Badge variant="solid" color="teal" size="xs" className="tracking-[6px] sm:tracking-[12px] uppercase bg-white/5 border border-white/10 backdrop-blur-3xl">Neural Presence: {world.personality}</Badge>
                <div className="flex gap-2">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i <= currentStage ? 'w-8 sm:w-12 bg-[#00adef]' : 'w-3 sm:w-4 bg-white/10'}`}></div>
                    ))}
                </div>
            </div>

            {/* 🌋 ADAPTIVE REACTIVITY RING */}
            <motion.div 
                animate={{ 
                    scale: 1 + reactivity * 0.3,
                    opacity: 0.05 + reactivity * 0.2,
                    borderColor: reactivity > 0.7 ? '#ef4444' : world.color
                }}
                className="absolute w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full border border-dashed opacity-10 animate-spin-slow pointer-events-none"
            />

            {/* 🔮 THE CORE INTERACTION AREA */}
            <div className="relative z-10 max-w-5xl w-full my-auto flex flex-col justify-center py-6">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentStage}
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                        className="space-y-8 sm:space-y-12 text-center"
                    >
                        <div className="space-y-4 sm:space-y-6">
                            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9] text-white">
                                {stage.title.split(' ')[0]} <br />
                                <span style={{ color: world.color }}>{stage.title.split(' ')[1] || ''}.</span>
                            </h2>
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-white/50 italic max-w-3xl mx-auto leading-relaxed px-4">
                                "{stage.text}"
                            </p>
                        </div>

                        {/* Special Mechanics based on Type */}
                        <div className="flex justify-center py-2">
                            {stage.type === 'breathe' && <BreathingOrb color={world.color} reactivity={reactivity} />}
                            {stage.type === 'scan' && <NeuralScanner color={world.color} />}
                            {stage.type === 'lock' && <ObjectLock color={world.color} />}
                            {stage.type === 'tension' && <SomaticMap color={world.color} />}
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <button 
                                onClick={isFinal ? onComplete : onNext}
                                className="group relative px-10 sm:px-16 py-4 sm:py-5 rounded-full font-black uppercase tracking-[10px] sm:tracking-[16px] text-xs transition-all active:scale-95 shadow-2xl flex items-center gap-4 overflow-hidden"
                                style={{ backgroundColor: world.color, color: '#fff' }}
                            >
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shimmer"></div>
                                {isFinal ? <LucideCheckCircle size={18} /> : <LucideArrowRight size={18} />}
                                <span>{stage.btn}</span>
                            </button>
                            {reactivity > 0.5 && (
                                <motion.p 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-rose-400 text-[10px] font-black uppercase tracking-[4px]"
                                >
                                    Pacing too fast. Breathe with the world.
                                </motion.p>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 🌲 ENVIRONMENTAL HINTS */}
            <div className="hidden sm:flex absolute bottom-8 left-10 flex-col gap-1 z-20 animate-fade-in">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[4px]">Atmosphere</p>
                <p className="text-xs font-bold text-[#00adef] uppercase tracking-[1px]">{world.atmosphere}</p>
            </div>
            <div className="hidden sm:flex absolute bottom-8 right-10 text-right flex-col gap-1 z-20 animate-fade-in">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[4px]">Neural Physics</p>
                <p className="text-xs font-bold text-white/60 uppercase tracking-[1px]">{world.physics}</p>
            </div>
        </motion.div>
    );
};

/**
 * 🧬 MINI-COMPONENTS FOR SPECIAL MECHANICS
 */

const ParticleSystem = ({ color, count }) => {
    const particles = useMemo(() => Array.from({ length: count }), [count]);
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0 }}
                    animate={{ 
                        x: [null, Math.random() * window.innerWidth],
                        y: [null, Math.random() * window.innerHeight],
                        opacity: [0, 0.4, 0],
                        scale: [1, 2, 1]
                    }}
                    transition={{ duration: 5 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
                    className="absolute w-1 h-1 rounded-full"
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    );
};

const BreathingOrb = ({ color, reactivity }) => (
    <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
        <motion.div 
            animate={{ 
                scale: [1, 1.8, 1],
                opacity: [0.1, 0.4, 0.1]
            }}
            transition={{ duration: 4 + reactivity * 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full blur-3xl"
            style={{ backgroundColor: color }}
        />
        <motion.div 
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 4 + reactivity * 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 flex items-center justify-center animate-pulse"
            style={{ borderColor: color }}
        >
            <LucideWind size={36} className="sm:w-12 sm:h-12" style={{ color }} />
        </motion.div>
    </div>
);

const NeuralScanner = ({ color }) => (
    <div className="w-64 h-32 relative border-b-2 border-white/10 overflow-hidden">
        <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm"
        />
        <div className="flex justify-between h-full items-end pb-2">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <motion.div 
                    key={i}
                    animate={{ height: [10, 40, 20] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    className="w-2 rounded-full"
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    </div>
);

const ObjectLock = ({ color }) => (
    <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-dashed rounded-full animate-spin-slow opacity-20" style={{ borderColor: color }}></div>
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 border-4 border-t-transparent rounded-full flex items-center justify-center"
            style={{ borderColor: color }}
        >
            <LucideEye size={32} style={{ color }} />
        </motion.div>
        <div className="absolute top-0 w-1 h-full bg-gradient-to-b from-white/40 via-transparent to-white/40 blur-sm"></div>
    </div>
);

const SomaticMap = ({ color }) => (
    <div className="relative w-64 h-64 flex items-center justify-center group">
        <LucideFingerprint size={120} className="text-white opacity-10 group-hover:opacity-40 transition-opacity duration-1000" />
        <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 border-4 rounded-[40px] opacity-10"
            style={{ borderColor: color }}
        />
    </div>
);

export default RecoveryJourney;
