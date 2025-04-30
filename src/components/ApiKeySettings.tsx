
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Key, Lock, AlertCircle, Wallet, Bitcoin, DollarSign } from "lucide-react";
import { tradingService } from "@/services/tradingService";

const ApiKeySettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiKeys, setApiKeys] = useState(tradingService.getApiKeys());
  const [settings, setSettings] = useState(tradingService.getSettings());

  // Submit API keys
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log(`[${new Date().toLocaleTimeString()}] INFO    Validating API keys with exchange`);
    
    try {
      const isValid = await tradingService.setKrakenApiKeys(apiKey, apiSecret);
      setApiKeys(tradingService.getApiKeys());
      
      if (isValid) {
        setApiKey('');
        setApiSecret('');
        console.log(`[${new Date().toLocaleTimeString()}] SUCCESS API keys validated successfully`);
      }
    } catch (error) {
      console.error("Error setting API keys:", error);
      console.log(`[${new Date().toLocaleTimeString()}] ERROR   API key validation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle paper trading
  const togglePaperTrading = (enabled: boolean) => {
    tradingService.updateSettings({ enablePaperTrading: enabled });
    setSettings(tradingService.getSettings());
    console.log(`[${new Date().toLocaleTimeString()}] INFO    Paper trading ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  // Toggle live trading
  const toggleLiveTrading = (enabled: boolean) => {
    // Only allow live trading if API keys are valid
    if (enabled && (!apiKeys.kraken || !apiKeys.kraken.isValid)) {
      return;
    }
    
    tradingService.updateSettings({ enableLiveTrading: enabled });
    setSettings(tradingService.getSettings());
    console.log(`[${new Date().toLocaleTimeString()}] INFO    Live trading ${enabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">API & Trading Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Trading toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Paper Trading</Label>
                <p className="text-sm text-muted-foreground">
                  Trade with simulated money for testing
                </p>
              </div>
              <Switch 
                checked={settings.enablePaperTrading}
                onCheckedChange={togglePaperTrading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Live Trading</Label>
                <p className="text-sm text-muted-foreground">
                  Trade with real funds (requires API keys)
                </p>
              </div>
              <Switch 
                checked={settings.enableLiveTrading}
                onCheckedChange={toggleLiveTrading}
                disabled={!apiKeys.kraken || !apiKeys.kraken.isValid}
              />
            </div>
          </div>
          
          {/* Kraken API keys */}
          <div className="border-t border-dark-border pt-4">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Key className="w-4 h-4 mr-2" />
              Kraken API Keys
            </h3>
            
            {apiKeys.kraken && (
              <div className="mb-4">
                <div className="p-3 rounded-md bg-dark-border/20 mb-3">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm truncate w-[200px] sm:w-full">
                        API Key: {apiKeys.kraken.apiKey.substring(0, 4)}...{apiKeys.kraken.apiKey.substring(apiKeys.kraken.apiKey.length - 4)}
                      </p>
                    </div>
                    <div className="ml-2">
                      {apiKeys.kraken.isValid ? (
                        <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-xs flex items-center">
                          <Check className="w-3 h-3 mr-1" /> Valid
                        </div>
                      ) : (
                        <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded-md text-xs flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" /> Invalid
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {apiKeys.kraken.isValid && apiKeys.kraken.balance && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-blue-500/10 p-3 rounded-md border border-blue-500/20">
                      <div className="flex items-center text-blue-400 text-xs font-medium mb-1">
                        <Bitcoin className="w-3 h-3 mr-1" />
                        BTC Balance
                      </div>
                      <div className="text-lg font-bold">
                        {apiKeys.kraken.balance.BTC?.toFixed(8)}
                      </div>
                    </div>
                    <div className="bg-green-500/10 p-3 rounded-md border border-green-500/20">
                      <div className="flex items-center text-green-400 text-xs font-medium mb-1">
                        <DollarSign className="w-3 h-3 mr-1" />
                        USD Balance
                      </div>
                      <div className="text-lg font-bold">
                        ${apiKeys.kraken.balance.USD?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="Enter your Kraken API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-dark-border/10 border-dark-border"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiSecret">API Secret</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder="Enter your Kraken API Secret"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="bg-dark-border/10 border-dark-border"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Validating...' : 'Connect Exchange'}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeySettings;
