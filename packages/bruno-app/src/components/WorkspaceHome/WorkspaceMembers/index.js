import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { IconTrash, IconUserPlus } from '@tabler/icons';
import toast from 'react-hot-toast';
import { api } from 'sync/convex/api';
import { useConvexSync } from 'sync/convex/ConvexSyncProvider';
import Button from 'ui/Button';
import StyledWrapper from './StyledWrapper';

const editableRoles = ['admin', 'editor', 'viewer'];

const isConvexWorkspace = (workspace) => workspace?.source === 'convex' || workspace?.pathname?.startsWith('convex:');

const WorkspaceMembersPanel = ({ workspace }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [saving, setSaving] = useState(false);
  const members = useQuery(api.workspaces.members, { workspaceId: workspace.uid });
  const inviteMember = useMutation(api.workspaces.inviteMember);
  const updateMemberRole = useMutation(api.workspaces.updateMemberRole);
  const removeMember = useMutation(api.workspaces.removeMember);

  const canManageMembers = workspace?.role === 'owner' || workspace?.role === 'admin';
  const sortedMembers = useMemo(() => {
    return [...(members || [])].sort((a, b) => {
      const left = a.user?.email || a.invitedEmail || '';
      const right = b.user?.email || b.invitedEmail || '';
      return left.localeCompare(right);
    });
  }, [members]);

  const handleInvite = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }

    setSaving(true);
    try {
      await inviteMember({
        workspaceId: workspace.uid,
        email: email.trim(),
        role
      });
      setEmail('');
      toast.success('Invite saved');
    } catch (err) {
      toast.error(err?.message || 'Could not invite member');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (member, nextRole) => {
    try {
      await updateMemberRole({
        workspaceId: workspace.uid,
        memberId: member._id,
        role: nextRole
      });
    } catch (err) {
      toast.error(err?.message || 'Could not update role');
    }
  };

  const handleRemove = async (member) => {
    try {
      await removeMember({
        workspaceId: workspace.uid,
        memberId: member._id
      });
    } catch (err) {
      toast.error(err?.message || 'Could not remove member');
    }
  };

  return (
    <StyledWrapper>
      <div className="members-header">
        <div className="section-title">Members</div>
        <div className="member-count">{sortedMembers.length}</div>
      </div>

      {canManageMembers && (
        <form className="invite-form" onSubmit={handleInvite}>
          <input
            type="email"
            value={email}
            placeholder="email@example.com"
            onChange={(event) => setEmail(event.target.value)}
            disabled={saving}
            required
          />
          <select value={role} onChange={(event) => setRole(event.target.value)} disabled={saving}>
            {editableRoles.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <Button
            color="light"
            size="sm"
            icon={<IconUserPlus size={14} strokeWidth={1.5} />}
            type="submit"
            disabled={saving}
          >
            Invite
          </Button>
        </form>
      )}

      <div className="members-list">
        {members === undefined ? (
          <div className="empty-members">Loading</div>
        ) : sortedMembers.length === 0 ? (
          <div className="empty-members">No members</div>
        ) : (
          sortedMembers.map((member) => {
            const isOwner = member.role === 'owner';
            const label = member.user?.email || member.invitedEmail || 'Unknown user';
            return (
              <div className="member-row" key={member._id}>
                <div className="member-info">
                  <div className="member-email">{label}</div>
                  <div className="member-status">{member.status}</div>
                </div>
                <div className="member-controls">
                  {canManageMembers && !isOwner ? (
                    <select value={member.role} onChange={(event) => handleRoleChange(member, event.target.value)}>
                      {editableRoles.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="member-role">{member.role}</span>
                  )}
                  {canManageMembers && !isOwner && (
                    <button className="remove-member" type="button" onClick={() => handleRemove(member)} aria-label="Remove member">
                      <IconTrash size={14} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </StyledWrapper>
  );
};

const WorkspaceMembers = ({ workspace }) => {
  const { enabled } = useConvexSync();
  if (!enabled || !isConvexWorkspace(workspace)) {
    return null;
  }

  return <WorkspaceMembersPanel workspace={workspace} />;
};

export default WorkspaceMembers;
