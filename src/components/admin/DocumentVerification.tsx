import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileCheck, CheckCircle2, XCircle, Loader2, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { usePendingDocuments, useApproveDocument, useRejectDocument } from "@/hooks/useDocumentVerification";

export function DocumentVerification() {
  const { data: pendingDocs = [], isLoading } = usePendingDocuments();
  const approveDoc = useApproveDocument();
  const rejectDoc = useRejectDocument();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = (docId: string) => {
    approveDoc.mutate(docId);
  };

  const handleRejectClick = (docId: string) => {
    setSelectedDocId(docId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedDocId && rejectionReason.trim()) {
      rejectDoc.mutate(
        { documentId: selectedDocId, reason: rejectionReason },
        {
          onSuccess: () => {
            setRejectDialogOpen(false);
            setSelectedDocId(null);
            setRejectionReason('');
          },
        }
      );
    }
  };

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-pending" />
            Document Verification Queue
          </CardTitle>
          <CardDescription>
            Review and verify pending DDT documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendingDocs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50 text-verified" />
              <p className="text-sm">No pending documents</p>
              <p className="text-xs mt-1">All documents have been verified</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DDT Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingDocs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium font-mono">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.ddt_number}
                      </div>
                    </TableCell>
                    <TableCell>
                      {doc.vendor?.business_name || doc.vendor?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {doc.school?.name || 'Not assigned'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(doc.upload_date), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-verified border-verified/30 hover:bg-verified/10"
                          onClick={() => handleApprove(doc.id)}
                          disabled={approveDoc.isPending}
                        >
                          {approveDoc.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleRejectClick(doc.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document. This will be visible to the vendor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim() || rejectDoc.isPending}
            >
              {rejectDoc.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
