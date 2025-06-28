import React, { useState, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  GitBranch, 
  Edit3, 
  Check, 
  X, 
  ChevronDown,
  Zap,
  Hash,
  Type,
  Target
} from 'lucide-react';

interface ConditionalBranchData {
  title: string;
  condition: string;
  value: string;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

const ConditionalBranchNode: React.FC<NodeProps<ConditionalBranchData>> = ({ id, data, selected }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(data.title);
  const [showConditions, setShowConditions] = useState(false);

  const conditions = [
    { id: 'contains', label: 'Output contains', icon: Type, placeholder: 'Enter text to search for' },
    { id: 'keyword', label: 'Includes keyword', icon: Hash, placeholder: 'Enter keyword' },
    { id: 'token_count', label: 'Token count >', icon: Zap, placeholder: 'Enter number' },
    { id: 'score_above', label: 'Score above', icon: Target, placeholder: 'Enter score (0-10)' },
    { id: 'length_above', label: 'Length above', icon: Type, placeholder: 'Enter character count' }
  ];

  const selectedCondition = conditions.find(c => c.id === data.condition) || conditions[0];
  const ConditionIcon = selectedCondition.icon;

  const handleTitleSave = () => {
    data.onUpdate(id, { title: tempTitle });
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(data.title);
    setIsEditingTitle(false);
  };

  const handleConditionChange = (conditionId: string) => {
    data.onUpdate(id, { condition: conditionId });
    setShowConditions(false);
  };

  const handleValueChange = (value: string) => {
    data.onUpdate(id, { value });
  };

  return (
    <div className={`relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border-2 transition-all duration-300 min-w-[280px] max-w-[320px] overflow-hidden ${
      selected 
        ? 'border-blue-400 shadow-blue-200/50 shadow-2xl scale-105' 
        : 'border-gray-200 hover:border-gray-300 hover:shadow-2xl hover:scale-102'
    }`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 border-2 border-white shadow-lg"
      />

      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            {isEditingTitle ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm font-semibold bg-white border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                  autoFocus
                />
                <button onClick={handleTitleSave} className="text-green-500 hover:text-green-600 transition-colors">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={handleTitleCancel} className="text-red-500 hover:text-red-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{data.title}</h3>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Condition Selector */}
        <div className="space-y-4">
          <div className="relative">
            <button
              onClick={() => setShowConditions(!showConditions)}
              className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <ConditionIcon className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-800">{selectedCondition.label}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showConditions ? 'rotate-180' : ''}`} />
            </button>

            {showConditions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                {conditions.map((condition) => {
                  const Icon = condition.icon;
                  return (
                    <button
                      key={condition.id}
                      onClick={() => handleConditionChange(condition.id)}
                      className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-800">{condition.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Value Input */}
          <div>
            <input
              type="text"
              value={data.value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={selectedCondition.placeholder}
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none transition-all duration-200 shadow-sm focus:shadow-md font-medium text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Branch Labels */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-sm"></div>
            <span className="text-sm font-semibold text-green-700">YES</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-red-700">NO</span>
            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>

      {/* Output Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 border-2 border-white shadow-lg"
        style={{ top: '40%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="no"
        className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 border-2 border-white shadow-lg"
        style={{ top: '60%' }}
      />

      {/* Glow Effect */}
      {selected && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl pointer-events-none"></div>
      )}
    </div>
  );
};

export default memo(ConditionalBranchNode);