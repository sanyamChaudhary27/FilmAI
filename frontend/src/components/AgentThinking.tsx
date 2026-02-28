import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, Sparkles } from 'lucide-react';
import { type EditPlan } from '../services/api';

interface AgentThinkingProps {
  isVisible: boolean;
  plan?: EditPlan | null;
}

const AgentThinking: React.FC<AgentThinkingProps> = ({ isVisible, plan }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="thinking-overlay glass"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="thinking-content">
            <div className="icon-stack">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Cpu size={48} className="cpu-icon" />
              </motion.div>
              <motion.div
                className="brain-container"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain size={32} className="brain-icon" />
              </motion.div>
            </div>

            <h3>Agent is Generating Plan...</h3>
            <p className="thinking-hint">Parsing your request and mapping video segments.</p>

            {plan && (
              <motion.div
                className="mini-plan"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="plan-header">
                  <Sparkles size={14} />
                  <span>Proposed Workflow</span>
                </div>
                <ul>
                  {plan.actions?.map((action: any, i: number) => (
                    <li key={i}>• {action.action} ({action.start_time}s - {action.end_time}s)</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          <style>{`
            .thinking-overlay {
              position: absolute;
              inset: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 100;
              background: rgba(10, 10, 12, 0.8);
            }
            
            .thinking-content {
              text-align: center;
              max-width: 400px;
            }
            
            .icon-stack {
              position: relative;
              width: 80px;
              height: 80px;
              margin: 0 auto 24px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .cpu-icon {
              color: var(--primary);
              opacity: 0.5;
            }
            
            .brain-container {
              position: absolute;
              color: var(--secondary);
            }
            
            h3 {
              font-size: 24px;
              margin-bottom: 8px;
            }
            
            .thinking-hint {
              color: var(--text-muted);
              margin-bottom: 32px;
            }
            
            .mini-plan {
              background: rgba(255, 255, 255, 0.03);
              border-radius: 12px;
              padding: 16px;
              text-align: left;
              border: 1px solid var(--border);
            }
            
            .plan-header {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: var(--primary);
              margin-bottom: 12px;
            }
            
            .mini-plan ul {
              list-style: none;
              font-size: 14px;
              color: var(--text-muted);
            }
            
            .mini-plan li {
              margin-bottom: 4px;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentThinking;
