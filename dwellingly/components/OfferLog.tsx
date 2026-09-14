import React, { useState } from 'react';
import { Transaction, Offer, DealStatus } from '../types';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import { DollarSign, Calendar, FileText, Check, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface OfferLogProps {
  transaction: Transaction;
  onAddOffer: (offer: Omit<Offer, 'id'>) => void;
  onExecuteOffer: (offerId: string, executedDate: Date) => void;
}

const OfferLog: React.FC<OfferLogProps> = ({ transaction, onAddOffer, onExecuteOffer }) => {
  const [showForm, setShowForm] = useState(false);
  const [newOffer, setNewOffer] = useState({ buyerName: '', offerAmount: '', keyTerms: '' });
  const [executingOfferId, setExecutingOfferId] = useState<string | null>(null);
  const [executionDate, setExecutionDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOffer({
      buyerName: newOffer.buyerName,
      offerAmount: parseFloat(newOffer.offerAmount),
      receivedDate: new Date(),
      status: 'active',
      keyTerms: newOffer.keyTerms
    });
    setShowForm(false);
    setNewOffer({ buyerName: '', offerAmount: '', keyTerms: '' });
  };

  const handleExecute = (offerId: string) => {
     if (!executionDate) return;
     onExecuteOffer(offerId, new Date(executionDate));
     setExecutingOfferId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Offer Log</h2>
          <p className="text-ink0">Track offers received and execute your final contract.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Log New Offer
        </Button>
      </div>

      {showForm && (
        <Card className="bg-muted border-rule">
           <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold text-ink">Log Received Offer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-ink mb-1">Buyer Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-3 py-2 border border-rule rounded-md"
                      value={newOffer.buyerName}
                      onChange={e => setNewOffer({...newOffer, buyerName: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-ink mb-1">Offer Amount ($)</label>
                    <input 
                      type="number" 
                      required
                      className="w-full px-3 py-2 border border-rule rounded-md"
                      value={newOffer.offerAmount}
                      onChange={e => setNewOffer({...newOffer, offerAmount: e.target.value})}
                    />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-ink mb-1">Key Terms / Notes</label>
                    <textarea 
                       className="w-full px-3 py-2 border border-rule rounded-md"
                       placeholder="Closing date, option period length, concessions..."
                       value={newOffer.keyTerms}
                       onChange={e => setNewOffer({...newOffer, keyTerms: e.target.value})}
                    />
                 </div>
              </div>
              <div className="flex justify-end gap-2">
                 <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                 <Button type="submit">Log Offer</Button>
              </div>
           </form>
        </Card>
      )}

      <div className="space-y-4">
         {transaction.offers.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-rule rounded-xl bg-muted">
               <DollarSign className="w-10 h-10 text-ink mx-auto mb-3" />
               <p className="text-ink0">No offers logged yet.</p>
            </div>
         ) : (
            transaction.offers.map(offer => (
               <Card key={offer.id} className={offer.status === 'accepted' ? 'ring-2 ring-positive/30' : ''}>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-lg font-bold text-ink">{offer.buyerName}</h3>
                           <Badge variant={offer.status === 'accepted' ? 'success' : 'neutral'}>{offer.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-ink-soft">
                           <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> ${offer.offerAmount.toLocaleString()}</span>
                           <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(offer.receivedDate), 'MMM d, yyyy')}</span>
                        </div>
                        {offer.keyTerms && (
                           <p className="mt-3 text-sm text-ink0 bg-muted p-2 rounded">{offer.keyTerms}</p>
                        )}
                     </div>
                     
                     <div className="flex flex-col gap-2 justify-center min-w-[200px]">
                        {transaction.status === DealStatus.PRE_LISTING || transaction.status === DealStatus.ACTIVE ? (
                            executingOfferId === offer.id ? (
                               <div className="bg-muted p-3 rounded-lg animate-in fade-in">
                                  <label className="block text-xs font-semibold text-ink mb-1">Effective Date (from Contract)</label>
                                  <input 
                                     type="date" 
                                     className="w-full mb-2 px-2 py-1 text-sm border rounded"
                                     value={executionDate}
                                     onChange={e => setExecutionDate(e.target.value)}
                                  />
                                  <div className="flex gap-2">
                                     <Button size="sm" onClick={() => handleExecute(offer.id)}>Confirm</Button>
                                     <Button size="sm" variant="outline" onClick={() => setExecutingOfferId(null)}>Cancel</Button>
                                  </div>
                               </div>
                            ) : (
                               <Button variant="secondary" onClick={() => setExecutingOfferId(offer.id)}>
                                  <Check className="w-4 h-4 mr-2" /> Mark Executed
                               </Button>
                            )
                        ) : null}
                        
                        <Button variant="outline" size="sm">
                           <FileText className="w-4 h-4 mr-2" /> View Attachment
                        </Button>
                     </div>
                  </div>
               </Card>
            ))
         )}
      </div>
    </div>
  );
};

export default OfferLog;