import { parseSettings } from '@usecannon/cli';
import { task } from 'hardhat/config';
import { augmentProvider } from '../internal/augment-provider';
import { cannonBuild } from '../internal/cannon';
import { parseAnvilOptions } from '../internal/parse-anvil-options';
import { runTypeChainForOutputs } from '../internal/typechain';
import { SubtaskRunAnvilNodeResult } from '../subtasks/run-anvil-node';
import { SUBTASK_RUN_ANVIL_NODE, TASK_TEST } from '../task-names';

const DEFAULT_CANNONFILE = 'cannonfile.toml';

task(TASK_TEST, 'Utility for running hardhat tests on the cannon network')
  .addOptionalPositionalParam('cannonfile', 'Path to a test cannonfile to build', DEFAULT_CANNONFILE)
  .addOptionalVariadicPositionalParam('settings', 'Custom settings for building the cannonfile', [])
  .addOptionalParam('preset', '(Optional) The preset label for storing the build with the given settings')
  .addOptionalParam(
    'anvilOptions',
    '(Optional) Custom anvil options json string or json file to configure when running on the cannon network or a local forked node'
  )
  .addOptionalParam('registryPriority', '(Optional) Which registry should be used first?', 'local')
  .addOptionalParam('typechainOutDir', '(Optional) Folder where to write typechain types from the built cannonfile')
  .addOptionalParam('typechainTarget', '(Optional) Format of Typechain files, defaults to ethers-v5', 'ethers-v5')
  .addFlag('noCompile', "Don't compile before running this task")
  .addOptionalParam('testFiles', 'An optional list of files separated by a comma to test')
  .addFlag('parallel', 'Run tests in parallel')
  .addFlag('bail', 'Stop running tests after the first test failure')
  .addOptionalParam('grep', 'Only run tests matching the given string or regexp')
  .setAction(async (params, hre) => {
    let { cannonfile } = params;
    const {
      settings,
      anvilOptions: anvilOptionsParam,
      preset,
      typechainOutDir,
      typechainTarget,
      ...hardhatTestParams
    } = params;

    // If the first param is not a cannonfile, it should be parsed as settings
    if (typeof cannonfile === 'string' && !cannonfile.endsWith('.toml')) {
      settings.unshift(cannonfile);
      cannonfile = DEFAULT_CANNONFILE;
    }

    const parsedSettings = parseSettings(settings);

    const anvilOptions = parseAnvilOptions(anvilOptionsParam);
    const node = (await hre.run(SUBTASK_RUN_ANVIL_NODE, {
      dryRun: hre.network.name === 'cannon' || hre.network.name === 'hardhat',
      anvilOptions,
    })) as SubtaskRunAnvilNodeResult;

    if (!node) throw new Error('Invalid anvil instance');

    const { outputs } = await cannonBuild({
      hre,
      node,
      cannonfile,
      preset,
      settings: parsedSettings,
    });

    await augmentProvider(hre, outputs);

    hre.cannon.outputs = outputs;

    if (typechainOutDir) {
      await runTypeChainForOutputs(
        {
          cwd: hre.config.paths.root,
          target: typechainTarget,
          outDir: typechainOutDir,
          flags: {
            alwaysGenerateOverloads: true,
            discriminateTypes: true,
            environment: undefined,
          },
        },
        hre.cannon.outputs
      );
    }

    return await hre.run('test', hardhatTestParams);
  });