import {
  listBoardsForUser,
  createBoard,
  getBoardWithLists,
  createList,
  createCard,
  moveCard,
  updateBoard,
  archiveBoard
} from '../services/boardService.js';

export async function listBoardsController(req, res, next) {
  try {
    const boards = await listBoardsForUser(req.user.id);
    return res.json({ success: true, boards });
  } catch (err) {
    return next(err);
  }
}

export async function createBoardController(req, res, next) {
  try {
    const board = await createBoard(req.user.id, req.body);
    const io = req.app.get('io');
    if (io) {
      io.to(`workspace:${board.workspace_id}`).emit('board:created', board);
    }
    return res.status(201).json({ success: true, board });
  } catch (err) {
    return next(err);
  }
}

export async function getBoardController(req, res, next) {
  try {
    const { board, lists, cards } = await getBoardWithLists(
      Number(req.params.id),
      req.user.id
    );
    return res.json({ success: true, board, lists, cards });
  } catch (err) {
    return next(err);
  }
}

export async function createListController(req, res, next) {
  try {
    const list = await createList(req.body);
    const io = req.app.get('io');
    if (io) {
      io.to(`board:${list.board_id}`).emit('list:created', list);
    }
    return res.status(201).json({ success: true, list });
  } catch (err) {
    return next(err);
  }
}

export async function createCardController(req, res, next) {
  try {
    const card = await createCard({
      ...req.body,
      createdBy: req.user.id
    });
    const io = req.app.get('io');
    if (io) {
      io.to(`board:${req.body.boardId}`).emit('card:created', card);
    }
    return res.status(201).json({ success: true, card });
  } catch (err) {
    return next(err);
  }
}

export async function moveCardController(req, res, next) {
  try {
    const card = await moveCard(req.body);
    const io = req.app.get('io');
    if (io) {
      io.to(`board:${req.body.boardId}`).emit('card:moved', card);
    }
    return res.json({ success: true, card });
  } catch (err) {
    return next(err);
  }
}

export async function updateBoardController(req, res, next) {
  try {
    const board = await updateBoard(Number(req.params.id), req.user.id, req.body);
    return res.json({ success: true, board });
  } catch (err) {
    return next(err);
  }
}

export async function archiveBoardController(req, res, next) {
  try {
    await archiveBoard(Number(req.params.id), req.user.id);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
}


