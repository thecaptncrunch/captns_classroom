import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CaptnsClassroom } from "../target/types/captns_classroom";
import { PublicKey } from '@solana/web3.js';
import { assert } from "chai";

const STUDENT_SEED = "NEW_STUDENT"; 
const GRADE_SEED = "NEW_GRADES"

describe("captns_classroom", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.CaptnsClassroom as Program<CaptnsClassroom>;

  // three students
  const alyssa = anchor.web3.Keypair.generate();
  const marnie = anchor.web3.Keypair.generate();
  const vee    = anchor.web3.Keypair.generate();

  // first names
  const alyssa_firstname = "Alyssa";

  // name test cases
  const empty_name = "";
  const character_name = "🍅";
  const repeat_name = "Alyssa";

  // grades
  const alyssa_midterm1 = 187.5;
  const alyssa_final1   = 100.0;
  const alyssa_homeworka1 = 73.7;
  const alyssa_homeworkb1 = 4.2;

  const alyssa_final2   = 144.0;

  async function ensureStudentExists(firstName: string, kp: anchor.web3.Keypair) {
    const [pda] = getStudentAcctAddress(firstName, kp.publicKey, program.programId);
    try {
      await program.account.student.fetch(pda);
    } catch {
      await airdrop(provider.connection, kp.publicKey);
      await program.methods
        .createStudent(firstName)
        .accounts({ studentIdentifier: kp.publicKey })
        .signers([kp])
        .rpc({ commitment: "confirmed" });
    }
    return pda;
  }

  describe("Create students", () => {

    it("Should not allow the same student to be created twice", async () => {
      let threw = false;
      try {
        await program.methods
          .createStudent(repeat_name) 
          .accounts({ studentIdentifier: alyssa.publicKey })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Duplicate student creation should throw");
    });

    it("Should not allow a name past the maximum allowed characters", async () => {
      const longName = "X".repeat(40);
      const tmpStudent = anchor.web3.Keypair.generate();
      await airdrop(provider.connection, tmpStudent.publicKey);

      let threw = false;
      try {
        await program.methods
          .createStudent(longName)
          .accounts({ studentIdentifier: tmpStudent.publicKey })
          .signers([tmpStudent])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Should reject names longer than allowed");
    });

    it("Should not allow a name with any special characters", async () => {
      const tmpStudent = anchor.web3.Keypair.generate();
      await airdrop(provider.connection, tmpStudent.publicKey);

      let threw = false;
      try {
        await program.methods
          .createStudent(character_name)
          .accounts({ studentIdentifier: tmpStudent.publicKey })
          .signers([tmpStudent])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Should reject special character names");
    });

    it("Should not allow a student to create an account more than once", async () => {
      let threw = false;
      try {
        await program.methods
          .createStudent(alyssa_firstname)
          .accounts({ studentIdentifier: alyssa.publicKey })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Same student wallet should not be able to create twice");
    });

    it("Should not allow a student to create an account with no characters", async () => {
      const tmpStudent = anchor.web3.Keypair.generate();
      await airdrop(provider.connection, tmpStudent.publicKey);

      let threw = false;
      try {
        await program.methods
          .createStudent(empty_name)
          .accounts({ studentIdentifier: tmpStudent.publicKey })
          .signers([tmpStudent])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Should reject empty names");
    });
  });

  describe("Delete students", () => {
    it("1) Should fail when removing non-existent student", async () => {
      const ghost = anchor.web3.Keypair.generate();
      await airdrop(provider.connection, ghost.publicKey);

      const ghost_name = "Ghost";
      let threw = false;
      try {
        await program.methods
          .deleteStudent(ghost_name)
          .accounts({ studentIdentifier: ghost.publicKey })
          .signers([ghost])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Deleting a non-existent student should fail");
    });
  });

describe("Submit grades", () => {

it("Should not allow submitting grades twice without deleting first", async () => {
  const alyssaPda = await ensureStudentExists(alyssa_firstname, alyssa);

  await program.methods
    .submitGrades(alyssa_midterm1, alyssa_final1, alyssa_homeworka1, alyssa_homeworkb1)
    .accounts({ submitter: alyssa.publicKey })
    .signers([alyssa])
    .rpc({ commitment: "confirmed" });

  let threw = false;
  try {
    await program.methods
      .submitGrades(alyssa_midterm1, alyssa_final2, alyssa_homeworka1, alyssa_homeworkb1)
      .accounts({ submitter: alyssa.publicKey })
      .signers([alyssa])
      .rpc({ commitment: "confirmed" });
  } catch {
    threw = true;
  }

  assert.isTrue(threw, "Re-submission without deleting grades should fail");

  const s = await program.account.student.fetch(alyssaPda);
  assert.isAtLeast(Number(s.finalGrade), 5);
  assert.isAtMost(Number(s.finalGrade), 100);
  });
});

  describe("Delete grades", () => {
    it("Should close the grades account", async () => {
      await ensureStudentExists(alyssa_firstname, alyssa);

      await program.methods
        .submitGrades(alyssa_midterm1, alyssa_final1, alyssa_homeworka1, alyssa_homeworkb1)
        .accounts({ submitter: alyssa.publicKey })
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      const [gradesPda] = getGradeAcctAddress(alyssa.publicKey, program.programId);

      await program.account.grades.fetch(gradesPda);

      await program.methods
        .deleteGrades()
        .accounts({ submitter: alyssa.publicKey })
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      let fetchThrew = false;
      try { await program.account.grades.fetch(gradesPda); } catch { fetchThrew = true; }
      const info = await provider.connection.getAccountInfo(gradesPda);

      assert.isTrue(fetchThrew, "Fetching a closed grades account should throw");
      assert.isNull(info, "Closed grades account should be fully deallocated (null)");
    });
  });
});

async function airdrop(connection: any, address: any, amount = 1_000_000_000) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, amount),
    "confirmed"
  );
}

function getStudentAcctAddress(first_name: string, student: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(first_name),
      anchor.utils.bytes.utf8.encode(STUDENT_SEED),
      student.toBuffer(),
    ],
    programID
  );
}

function getGradeAcctAddress(grader: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(GRADE_SEED),
      grader.toBuffer(),
    ],
    programID
  );
}
