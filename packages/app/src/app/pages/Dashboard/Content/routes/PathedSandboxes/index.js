import React from 'react';
import { uniq } from 'lodash';
import { inject, observer, Observer } from 'mobx-react';
import { Query } from 'react-apollo';

import { basename } from 'path';

import Sandboxes from '../../Sandboxes';
import Navigation from './Navigation';
import CreateNewSandbox from '../../CreateNewSandbox';

import { PATHED_SANDBOXES_CONTENT_QUERY } from '../../../queries';

const PathedSandboxes = props => {
  const path = '/' + (props.match.params.path || '');

  document.title = `${basename(path) || 'Dashboard'} - CodeSandbox`;

  return (
    <Query query={PATHED_SANDBOXES_CONTENT_QUERY} variables={{ path }}>
      {({ loading, error, data }) => (
        <Observer>
          {() => {
            if (error) {
              console.error(error);
              return <div>Error!</div>;
            }

            const sandboxes =
              loading || !data.me.collection
                ? []
                : data.me.collection.sandboxes;

            const possibleTemplates = uniq(
              sandboxes.map(x => x.source.template)
            );

            const orderedSandboxes = props.store.dashboard.getFilteredSandboxes(
              sandboxes
            );

            return (
              <Sandboxes
                ExtraElement={({ style }) => (
                  <CreateNewSandbox
                    collectionId={
                      data &&
                      data.me &&
                      data.me.collection &&
                      data.me.collection.id
                    }
                    style={style}
                  />
                )}
                isLoading={loading}
                possibleTemplates={possibleTemplates}
                Header={<Navigation path={path} />}
                sandboxes={orderedSandboxes}
              />
            );
          }}
        </Observer>
      )}
    </Query>
  );
};

export default inject('store', 'signals')(observer(PathedSandboxes));
