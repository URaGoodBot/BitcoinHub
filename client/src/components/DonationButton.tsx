import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bitcoin, Copy, CheckCircle, Gift, Zap } from "lucide-react";
import { useDonation } from "@/contexts/DonationContext";
import { useToast } from "@/hooks/use-toast";

export function DonationButton() {
  const { donationAddress, hasDonated, markAsDonated, canPostMeme, memesPosted } = useDonation();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(donationAddress);
      setCopied(true);
      toast({
        title: "Address Copied!",
        description: "Bitcoin address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the address manually",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDonation = () => {
    markAsDonated();
    toast({
      title: "Thank you for your donation!",
      description: "You can now post 1 Bitcoin meme in the community section",
    });
  };

  if (hasDonated) {
    return (
      <Card className="border-green-500/20 bg-green-50/10 dark:bg-green-950/10">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-400">
            Donation Confirmed!
          </h3>
          <p className="text-muted-foreground mb-4">
            Thank you for supporting Bitcoin Hub!
          </p>
          <div className="space-y-2">
            <Badge variant={canPostMeme ? "default" : "secondary"} className="block w-fit mx-auto">
              {canPostMeme ? "Ready to Post Your Meme!" : `Memes Posted: ${memesPosted}/1`}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-500/20 bg-orange-50/10 dark:bg-orange-950/10">
      <CardHeader className="text-center">
        <div className="bg-orange-500/10 p-3 rounded-full w-fit mx-auto mb-4">
          <Bitcoin className="w-8 h-8 text-orange-500" />
        </div>
        <CardTitle className="text-orange-700 dark:text-orange-400">
          Unlock Meme Posting
        </CardTitle>
        <CardDescription>
          Donate any amount of Bitcoin to post 1 meme in our community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Gift className="h-4 w-4" />
          <AlertDescription>
            Any amount unlocks the ability to post 1 Bitcoin meme. Support the community!
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="btc-address">Bitcoin Address</Label>
          <div className="flex gap-2">
            <Input 
              id="btc-address"
              value={donationAddress}
              readOnly
              className="font-mono text-sm"
            />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleConfirmDonation}
            className="w-full"
            size="lg"
          >
            <Zap className="w-4 h-4 mr-2" />
            I've Made a Donation
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Click after sending any amount to unlock meme posting
          </p>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <h4 className="font-medium mb-2">What you get:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Ability to post 1 Bitcoin meme</li>
            <li>• Support for Bitcoin Hub development</li>
            <li>• Join the exclusive donor community</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}