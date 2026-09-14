import React, { useState } from 'react';
import { Account } from '../types';
import { Plus, Trash2, CheckCircle, Loader2, ShieldCheck, User } from 'lucide-react';

interface AccountManagerProps {
  accounts: Account[];
  onAddAccount: () => void;
  onRemoveAccount: (id: string) => void;
  onSetActiveAccount: (id: string) => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  accounts,
  onAddAccount,
  onRemoveAccount,
  onSetActiveAccount
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate OAuth delay
    setTimeout(() => {
      onAddAccount();
      setIsConnecting(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-xl border border-rule">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
             <h2 className="text-2xl font-bold text-ink">Connected Accounts</h2>
             <p className="text-ink0 mt-1">Manage multiple brand personas. Select the active account to post content.</p>
          </div>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center space-x-2 bg-bench hover:bg-sheet text-ink px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70"
          >
            {isConnecting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            <span>{isConnecting ? 'Connecting...' : 'Link New Account'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {accounts.map((account) => (
             <div 
                key={account.id} 
                className={`
                  relative rounded-xl border-2 p-6 transition-all group
                  ${account.status === 'active' 
                    ? 'border-rule bg-muted' 
                    : 'border-rule bg-white hover:border-rule hover:'}
                `}
             >
                {account.status === 'active' && (
                  <div className="absolute top-4 right-4 text-ink bg-muted px-2 py-1 rounded-full text-xs font-bold flex items-center">
                    <CheckCircle size={12} className="mr-1" /> Active
                  </div>
                )}

                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <img src={account.avatar} alt={account.name} className="w-16 h-16 rounded-full border-2 border-white object-cover" />
                    <div className="absolute -bottom-1 -right-1 bg-sheet text-ink p-1 rounded-full border-2 border-white">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-ink truncate">{account.name}</h3>
                    <p className="text-ink0 text-sm truncate">{account.handle}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                   {account.status !== 'active' ? (
                      <button 
                        onClick={() => onSetActiveAccount(account.id)}
                        className="w-full py-2 bg-white border border-rule text-ink font-medium rounded-lg hover:bg-muted hover:text-ink hover:border-rule transition-all"
                      >
                        Switch to Account
                      </button>
                   ) : (
                      <button disabled className="w-full py-2 bg-signal text-primary-foreground font-medium rounded-lg opacity-90 cursor-default">
                        Currently Active
                      </button>
                   )}
                   
                   {account.status !== 'active' && (
                      <button 
                        onClick={() => onRemoveAccount(account.id)}
                        className="w-full py-2 text-ink-soft hover:text-destructive text-sm font-medium flex justify-center items-center transition-colors"
                      >
                        <Trash2 size={14} className="mr-1" /> Disconnect
                      </button>
                   )}
                </div>
             </div>
           ))}
           
           {/* Add Placeholder Card if empty */}
           {accounts.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-rule rounded-xl bg-muted">
                  <User size={48} className="mx-auto text-ink mb-3" />
                  <h3 className="text-ink0 font-medium">No accounts linked</h3>
                  <p className="text-ink-soft text-sm mt-1">Connect an X/Twitter account to get started.</p>
              </div>
           )}
        </div>
      </div>

      <div className="bg-muted border border-rule rounded-lg p-6 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
        <div className="p-3 bg-white rounded-full text-positive shrink-0">
           <ShieldCheck size={24} />
        </div>
        <div>
           <h4 className="font-bold text-ink mb-1">Secure OAuth Connection</h4>
           <p className="text-ink-soft text-sm leading-relaxed max-w-3xl">
             We use the official Twitter/X API for secure authentication. You are redirected to Twitter to authorize the app, and we receive a secure token. We never see or store your password. Access tokens are encrypted and stored locally for your session.
           </p>
        </div>
      </div>
    </div>
  );
};
