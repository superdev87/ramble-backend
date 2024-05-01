const { gamerooms } = require("../socket");

exports.createGame = (req, res) => {
  let gamecode = req.body.gamecode;
  if(gamecode === undefined) {
    res.status(400).json({message: 'Invalide gamecode'});
    return;
  }

  if(gamerooms[gamecode] !== undefined) {
    res.status(400).json({message: 'Already exist gamecode'});
    return;
  }
  
  let owner = req.body.owner;

  gamerooms[gamecode] = {
    owner: owner,
    joiners: []
  }

  res.status(200).json({message: 'created gameroom successfully', gameCode: gamecode, gameroom: gamerooms[gamecode]});
}

exports.joinGame = (req, res) => {
  let gamecode = req.body.gamecode;
  if(gamecode === undefined) {
    res.status(400).json({message: 'Invalide gamecode'});
    return;
  }

  if(gamerooms[gamecode]) {
    const foundObject = gamerooms[gamecode].joiners.find(item => {
      // Use a comparison logic based on the properties you want to match
      return (
        item.ds_email === req.body.joiner.ds_email &&
        item.nm_user === req.body.joiner.nm_user
      )
    });

    if(!foundObject && gamerooms[gamecode].owner.ds_email != req.body.joiner.ds_email)
      gamerooms[gamecode]['joiners'].push(req.body.joiner);
    console.log(gamerooms[gamecode]);
    res.status(200).json({message: 'joined gameroom successfully', gameCode: gamecode, gameroom: gamerooms[gamecode]});
  } else {
    res.status(400).json({message: 'Invalid gamecode'});
  }
}