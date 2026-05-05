import React, { useState } from 'react';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Button from 'ui/Button';
import { defaultJwtConfig, generateJwt, jwtAlgorithms } from 'utils/jwt';
import StyledWrapper from './StyledWrapper';

const JwtAuth = ({ item, collection, request, updateAuth, save }) => {
  const dispatch = useDispatch();
  const [previewToken, setPreviewToken] = useState('');
  const [generating, setGenerating] = useState(false);
  const jwt = {
    ...defaultJwtConfig,
    ...get(request, 'auth.jwt', {})
  };

  const updateJwt = (patch) => {
    dispatch(
      updateAuth({
        mode: 'jwt',
        collectionUid: collection.uid,
        itemUid: item?.uid,
        content: {
          ...jwt,
          ...patch
        }
      })
    );
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = await generateJwt(jwt);
      setPreviewToken(`${jwt.tokenPrefix || 'Bearer'} ${token}`.trim());
    } catch (err) {
      toast.error(err?.message || 'Could not generate JWT');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <StyledWrapper className="mt-2 w-full">
      <div className="jwt-grid mb-3">
        <label>
          Algorithm
          <select className="mt-1" value={jwt.algorithm} onChange={(event) => updateJwt({ algorithm: event.target.value })}>
            {jwtAlgorithms.map((algorithm) => (
              <option key={algorithm} value={algorithm}>{algorithm}</option>
            ))}
          </select>
        </label>
        <label>
          Prefix
          <input className="mt-1" value={jwt.tokenPrefix || ''} onChange={(event) => updateJwt({ tokenPrefix: event.target.value })} />
        </label>
        <label>
          Expires
          <input
            className="mt-1"
            type="number"
            min="0"
            value={jwt.expiresInSeconds ?? ''}
            onChange={(event) => updateJwt({ expiresInSeconds: event.target.value ? Number(event.target.value) : undefined })}
          />
        </label>
      </div>
      <label className="block mb-3">
        Secret
        <input
          className="mt-1"
          type="password"
          value={jwt.secret || ''}
          onChange={(event) => updateJwt({ secret: event.target.value })}
        />
      </label>
      <label className="block mb-3">
        Header JSON
        <textarea value={jwt.header || ''} onChange={(event) => updateJwt({ header: event.target.value })} />
      </label>
      <label className="block mb-3">
        Payload JSON
        <textarea value={jwt.payload || ''} onChange={(event) => updateJwt({ payload: event.target.value })} />
      </label>
      <div className="flex items-center gap-2">
        <Button size="sm" color="light" type="button" onClick={handleGenerate} disabled={generating}>
          Generate
        </Button>
        <Button size="sm" type="button" onClick={save}>
          Save
        </Button>
      </div>
      {previewToken ? <div className="jwt-preview mt-3">{previewToken}</div> : null}
    </StyledWrapper>
  );
};

export default JwtAuth;
